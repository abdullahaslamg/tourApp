const express = require('express');
const morgan = require('morgan');
const tourRoutes = require('./routes/tourRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();
app.use(express.json());
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use((req, res, next) => {
  req.requestedTime = new Date().toISOString();
  console.log(req.requestedTime);
  next();
});

app.use('/api/v1/tours', tourRoutes);
app.use('/api/v1/users', userRoutes);
module.exports = app;

// const LoggerMiddleware = (req, res, next) => {
//   console.log(`Logged  ${req.url}  ${req.method} -- ${new Date()}`);
//   next();
// };

// app.use(LoggerMiddleware);
