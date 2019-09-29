const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });
const app = require('./app'); // needs env variables configured

// SAFETY NET -------------------------------------------
// handle unhandled rejections
process.on('unhandledRejection', err => {
  console.log('unhandled rejection!!!! Shutting down...');
  console.log(err.name, err.message);
  process.exit(1);
});

process.on('uncaughtException', err => {
  console.log('uncaught exception!!!! Shutting down...');
  console.log(err.name, err.message);
  process.exit(1);
});

// every 24 hours heroku shuts down our app and sends SIGTERM
process.on('SIGTERM', () => {
  console.log('SIGTERM RECEIVED, Shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
    // sigterm causes process to exit, dont need to call it here
  });
});

// console.log(process.env);
const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(DB, {
    // deal with deprecation warnings
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true
  })
  .then(() => {
    console.log('DB connection successful');
  });

// START SERVER ------------------------------------
const port = process.env.PORT || 3000; // have to do with heroku (process.env.PORT)
const server = app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});
