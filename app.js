const path = require('path');
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet'); // everyone uses this
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser'); // need to get cookies from parser
const compression = require('compression');

const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const bookingRouter = require('./routes/bookingRoutes');
const viewRouter = require('./routes/viewRoutes');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');

// adds a bunch of methods
const app = express(); // doing this is standard

// SET UP PUG ENGINE
app.set('view engine', 'pug'); // all happens behind the scenes, no import
app.set('views', path.join(__dirname, 'views')); // just do it this way

// 1) GLOBAL MIDDLEWARES ----------------------------
// serves a static file from the public folder
// and not from a route
app.use(express.static(path.join(__dirname, 'public')));


// Set Security HTTP headers
app.use(helmet());

// Development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev')); // use for logging
}

// limit requests from same API
const limiter = rateLimit({
  max: 100,
  window: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in an hour!'
});
// use limiter on all routes starting with /api
app.use('/api', limiter);

// BODY PARSER, reading data from body into req.body
// use middleware (function that modifies incoming request data)
// data from body is added to request
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded( { extended: true, limit: '10kb'})); // parse data from a url encoded form
app.use(cookieParser());

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

// prevent parameter pollution, allow duplicate values for whitelist
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsAverage',
      'ratingsQuantity',
      'maxGroupSize',
      'difficulty',
      'price'
    ]
  })
);

app.use(compression()); // compresses all text going to client

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

// ROUTES -------------------------------


// mount routers
app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouter); // specify route and router
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingRouter);

// CATCH ALL ERRORS. Note that this is at the end of the file!
app.all('*', (req, res, next) => {
  // express assumes any arguments in next are an error
  // skips all other middleware and goes straight to error handler middleware
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// ERROR HANDLING MIDDLEWARE ------------------------------------------
app.use(globalErrorHandler);

module.exports = app; // export our app
