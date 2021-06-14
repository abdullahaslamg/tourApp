const dotenv = require('dotenv');
const mongoose = require('mongoose');

process.on('uncaughtException', err => {
  console.log('UNCAUGHT EXCEPTION');
  console.log(err, err.message);
  process.exit(1);
});

dotenv.config({ path: './config.env' });

const DB = process.env.DATABASE_LOCAL;

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true
  })
  .then(() => {
    console.log('Successfully connected to the databae');
  });
const app = require('./app');

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`App is listening on port ${port}`);
});

process.on('unhandledRejection', err => {
  console.log('UNHANDLED REJECTIONS.. server is shutting down');
  console.log(err.message);
  server.close(() => {
    process.exit(1);
  });
});
