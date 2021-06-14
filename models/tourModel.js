const mongoose = require('mongoose');
const slugify = require('slugify');
const validator = require('validator');

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour must have a name'],
      unique: true,
      trim: true,
      maxlength: [40, 'A tour must have length less or equal to 40'],
      minlength: [10, 'A tour must have length more or equal to 10']
      // validate: [validator.isaplha, 'Tour name can only contains characters']
    },
    duration: {
      type: Number,
      required: [true, 'A tour must have a duration']
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have a max group size']
    },
    slug: String,
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'Rating must be 1 or above'],
      max: [5, 'Rating must be 5 or below']
    },
    ratingsQuantity: {
      type: Number,
      default: 0
    },
    price: {
      type: Number,
      required: [true, 'A tour must have a price']
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function(val) {
          // this only points to the current document on  NEW DOCUMENT <CREATION>
          // this doesn't work on update document
          return val < this.price;
        }
      }
    },
    summary: {
      type: String,
      required: [true, 'A tour must have a summary'],
      trim: true
    },
    difficulty: {
      type: String,
      required: [true, 'A tour must have a difficulty'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'difficulty must be either easy, medium or difficult'
      }
    },
    description: {
      type: String,
      trim: true
    },
    imageCover: {
      type: String,
      required: [true, 'A tour must have a imageCover']
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now
    },
    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false
    }
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtul properties are not stored into the database. They are add into our
// document on runtime.
tourSchema.virtual('durationWeeks').get(function() {
  return this.duration / 7;
});

// DOCUMENT MIDDLEWARE RUN BEFORE:  save() and create()
tourSchema.pre('save', function(next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

// tourSchema.pre('save', function(next) {
//   console.log('Before saving the document...');
//   next();
// });

// tourSchema.post('save', function(doc, next) {
//   console.log(doc);
//   next();
// });

// QUERY MIDDLEWARE APPLYS ON: find(), findOne, findByIdAndUpdate and so on..
// We use regular express below to because we want to find all the queries
// that starts with find not only the find
// tourSchema.pre('find', function(next) {
tourSchema.pre(/^find/, function(next) {
  this.find({ secretTour: { $ne: true } });
  this.start = Date.now();
  next();
});

tourSchema.post(/^find/, function(docs, next) {
  console.log(`Query took ${Date.now() - this.start} milliseconds`);
  // console.log(docs);
  next();
});

//  AGGREGATION MIDDLEWARE
tourSchema.pre('aggregate', function(next) {
  this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
  console.log(this.pipeline());
  next();
});
const Tour = mongoose.model('Tour', tourSchema);
module.exports = Tour;
