const path = require('path');
const morgan = require('morgan');
const express = require('express');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');

const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');

// GLOBAL MIDDLEWARES
const app = express();
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// helmet
app.use(helmet());

// rate limit, 100 requrest from same ip in one hour
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000, // 1 hour
  message:
    'Too many requests from this IP, please try again in an hour',
});

// apply rate limit middleware only to the /api routes
app.use('/api', limiter);

// body parser
app.use(express.json({ limit: '10kb' }));

// cookie parser
app.use(cookieParser());

// data sanitization against NoSQL query injection
app.use(mongoSanitize());

// data sanitization agains XSS
app.use(xss());

// prevent parameter pollution attacks
app.use(
  hpp({
    whitelist: [
      'duration',
      'difficulty',
      'price',
      'ratingsAverage',
      'ratingsQuantity',
    ],
  })
);

// serve static files
app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
  // console.log(req.headers);
  console.log('This is a middleware');
  next();
});

// ROUTES

app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);

// UNHANDLED routes

app.all('*', (req, res, next) => {
  const msg = `Can't find ${req.originalUrl} on this server`;

  next(new AppError(msg, 404));
});

// Global Error handling middleware

app.use(globalErrorHandler);

module.exports = app;
