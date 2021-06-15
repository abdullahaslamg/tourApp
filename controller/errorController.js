const AppError = require('./../utils/appError');

const handleCastError = err => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

const handleDuplicateError = err => {
  // const value = err.message.match(/(["'])(?:(?=(\\?))\2.)*?\1/);
  const value = Object.values(err.keyValue)[0];
  const message = `"${value}" already exists, tryAnother one`;
  return new AppError(message, 400);
};

const handleValidationError = err => {
  const values = Object.values(err.errors)
    .map(el => el.message)
    .join('. ');
  const message = `You tour must have: ${values}`;
  return new AppError(message, 400);
};

// Sending Developer mode error
const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack
  });
};

// Sending error for production mode
const sendErrorProd = (err, res) => {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message
    });
  } else {
    // log errors
    console.error(err);

    // Send generic message
    res.status(500).json({
      status: 'error',
      message: 'Something went wrong'
    });
  }
};

// Global error controller
module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err };
    if (err.name === 'CastError') error = handleCastError(error);
    if (err.code === 11000) error = handleDuplicateError(error);
    if (err.name === 'ValidationError') error = handleValidationError(error);
    sendErrorProd(error, res);
  }
};
