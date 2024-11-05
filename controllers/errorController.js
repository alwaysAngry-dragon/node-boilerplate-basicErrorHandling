const AppError = require('./../utils/appError');
function sendErrorDevelopment(err, res) {
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    error: err,
    stack: err.stack,
  });
}

function sendErrorProduction(err, res) {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    res.status(500).json({
      status: 'error',
      message:
        'Something went wrong, please try again later.',
    });
  }
}

function validationErrorDB(error) {
  let message = '';
  Object.values(error.errors).forEach((error) => {
    message += error.message + ' / ';
  });

  return new AppError(message, 400);
}

const globalErrorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDevelopment(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err };
    if (err.name === 'CastError') {
      const message = `Invalid id type: ${err.value}`;
      error = new AppError(message, 400);
    }
    if (err.code === 11000) {
      error = new AppError(
        `Duplicate field value: ${err.keyValue.name}`,
        400
      );
    }

    if (err.name === 'ValidationError') {
      error = validationErrorDB(err);
    }

    sendErrorProduction(error, res);
  }
};

module.exports = globalErrorHandler;

/*
    Common intenal error types that can be handled as operational


    error: CastError
    error: duplicate key error
    error: validation errors


*/
