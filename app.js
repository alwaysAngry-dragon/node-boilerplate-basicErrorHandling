const path = require('path');
const morgan = require('morgan');
const express = require('express');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');

const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

const app = express();
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
  // console.log(req.headers);
  console.log('This is a middleware');
  next();
});

app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

// UNHANDLED routes

app.all('*', (req, res, next) => {
  const msg = `Can't find ${req.originalUrl} on this server`;

  next(new AppError(msg, 404));
});

// Global Error handling middleware

app.use(globalErrorHandler);

module.exports = app;
