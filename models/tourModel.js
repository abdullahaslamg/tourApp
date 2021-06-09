const mongoose = require('mongoose');

const tourSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'A tour must have a name'],
    unique: true
  },
  duration: {
    type: Number,
    required: [true, 'A tour must have a duration']
  },
  maxGroupSize: {
    type: Number,
    required: [true, 'A tour must have a max group size']
  },
  ratingsAverage: {
    type: Number,
    default: 4.5
  },
  ratingsQuantity: {
    type: Number,
    default: 0
  },
  price: {
    type: Number,
    required: [true, 'A tour must have a price']
  },
  summary: {
    type: String,
    required: [true, 'A tour must have a summary'],
    trim: true
  },
  difficulty: {
    type: String,
    required: [true, 'A tour must have a difficulty']
  },
  description: {
    type: String,
    trim: true
  },
  imageCover: {
    type: String,
    required: [true, 'A tour must have a imageCover']
  },
  slug: {
    type: String
  },
  images: [String],
  createdAt: {
    type: Date,
    default: Date.now
  },
  startDates: [Date]
});

const Tour = mongoose.model('Tour', tourSchema);
module.exports = Tour;
