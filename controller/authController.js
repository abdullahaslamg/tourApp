const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const catchAsync = require('./../utils/catchAsync');
const User = require('./../models/userModel');
const AppError = require('./../utils/appError');

const signToken = id => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};
exports.signup = catchAsync(async (req, res, next) => {
  // const newUser = await User.create({
  //   name: req.body.name,
  //   email: req.body.email,
  //   password: req.body.password,
  //   passwordConfirm: req.body.passwordConfirm
  // });
  const newUser = await User.create(req.body);

  const token = signToken(newUser._id);
  res.status(201).json({
    status: 'success',
    token,
    data: {
      user: newUser
    }
  });
});

exports.login = async (req, res, next) => {
  const { email, password } = req.body;

  // Check if the user provide an email or password
  if (!email || !password) {
    return next(new AppError('Please provide an email or password'));
  }

  // Check if the user exists in the database
  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect email or password'));
  }

  const token = signToken(user._id);

  res.status(200).json({
    status: 'success',
    token
  });
};

// Protecting the routes
exports.protect = catchAsync(async (req, res, next) => {
  let token;

  // 1) Getting token and check if user is still there
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(
      new AppError('You are not logged in, Please login to get access')
    );
  }
  // 2) Verification token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // 3) check if user still exists
  const user = await User.findById(decoded.id);

  if (!user) {
    return next(
      new AppError('The users belonging to this id does not exits', 401)
    );
  }

  // 4) check if user changed password after the token was issued

  if (user.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError('User recently changed passowrd, please login again', 401)
    );
  }

  req.user = user;
  next();
});
