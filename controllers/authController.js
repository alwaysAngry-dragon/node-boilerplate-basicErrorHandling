const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const User = require('./../models/userModel');

function generateJWTToken(id) {
  return jwt.sign({ id }, process.env.JWT_SECRET_KEY, {
    expiresIn: process.env.JSW_EXPIRES_IN,
  });
}

exports.signup = catchAsync(async function (
  req,
  res,
  next
) {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    passwordChangedAt: req.body.passwordChangedAt,
    role: 'user', // Optional field for role assignment
  });

  const token = generateJWTToken(newUser._id);

  res.status(200).json({
    status: 'success',
    token,
    data: {
      user: newUser,
    },
  });
});

exports.login = catchAsync(async function (req, res, next) {
  const { email, password } = req.body;
  if (!email || !password) {
    return next(
      new AppError('Please provide email and password', 400)
    );
  }

  const user = await User.findOne({ email }).select(
    '+password'
  );

  if (
    !user ||
    !(await user.checkPassword(password, user.password))
  ) {
    return next(new AppError('Invalid credentials', 401));
  }

  const token = generateJWTToken(user._id);
  user.password = undefined;

  res.status(200).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
});

exports.protect = catchAsync(async function (
  req,
  res,
  next
) {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(
      new AppError('Your are not logged in', 401)
    );
  }

  // jwt verify throws an error if the token is not valid
  const decodedJWT = await promisify(jwt.verify)(
    token,
    process.env.JWT_SECRET_KEY
  );

  const currentUser = await User.findById(decodedJWT.id);

  if (!currentUser) {
    return next(new AppError('User no longer exists', 401));
  }

  if (
    currentUser.checkPasswordChangedAfterToken(
      decodedJWT.iat
    )
  ) {
    return next(
      new AppError('Password changed ! Login again', 401)
    );
  }

  req.currentUser = currentUser;

  next();
});

function promisify(fn) {
  return (...args) => {
    return new Promise((resolve, reject) => {
      fn(...args, (err, result) => {
        if (err) reject(err);
        resolve(result);
      });
    });
  };
}
