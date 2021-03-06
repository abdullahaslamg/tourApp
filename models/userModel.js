const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'A user must have a name']
  },
  email: {
    type: String,
    required: [true, 'A user must have an email'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email']
  },
  photo: String,
  password: {
    type: String,
    required: [true, 'A user must have a password'],
    minlength: 8,
    // Select methods works when we are reading the password
    select: false
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm your password'],
    validate: {
      validator: function(el) {
        return el === this.password;
      }
    }
  },
  passwordChangedAt: Date
});

userSchema.pre('save', async function(next) {
  // if the user changes only the email and we don't
  //want to modifiy password again
  // only run this function if password was actually modified
  if (!this.isModified('password')) return next();

  // Hash the password with th cost of 12
  this.password = await bcrypt.hash(this.password, 12);

  //Delte the password confirm field
  this.passwordConfirm = undefined;
  next();
});

// function for check if login user passowrd is correct or not
userSchema.methods.correctPassword = async function(
  currentPassword,
  userPassword
) {
  return await bcrypt.compare(currentPassword, userPassword);
};

// functon of check password changed time
userSchema.methods.changedPasswordAfter = function(JWTTimeStamp) {
  if (this.passwordChangedAt) {
    //getTime() to convert time into milliseconds
    const changedTimeStamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    // console.log(changedTimeStamp, JWTTimeStamp);
    return JWTTimeStamp < changedTimeStamp;
  }

  return false;
};

const User = mongoose.model('User', userSchema);
module.exports = User;
