const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const User = require('./../models/userModel');

function generateJWTToken(id) {
  return jwt.sign({ id }, process.env.JWT_SECRET_KEY, {
    expiresIn: process.env.JSW_EXPIRES_IN,
  });
}

function sendToken(statusCode, status, user, res) {
  const token = generateJWTToken(user._id);

  res.cookie('jwt', token, {
    expires: new Date(
      Date.now() +
        process.env.JWT_COOKIE_EXPIRES_IN *
          24 *
          60 *
          60 *
          1000
    ),
    httpOnly: true,
    secure: true,
  });

  res.status(statusCode).json({
    status,
    token,
    data: {
      user,
    },
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

  newUser.password = undefined;

  sendToken(200, 'success', newUser, res);
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

  user.password = undefined;

  sendToken(200, 'success', user, res);
});

exports.protect = catchAsync(async function (
  req,
  res,
  next
) {
  let token;

  if (req.cookies.jwt) {
    token = req.cookies.jwt;
    console.log('Cookie Yay');
  } else if (
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

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.currentUser.role)) {
      return next(
        new AppError(
          'You do not have permission to access this route',
          403
        )
      );
    }
    next();
  };
};

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

// FORGOT PASSWORD

exports.forgotPassword = catchAsync(async function (
  req,
  res,
  next
) {
  const user = await User.findOne({
    email: req.body.email,
  });

  if (!user) {
    return next(
      new AppError('No user found with that email', 404)
    );
  }

  const pwdResetToken =
    await user.createPasswordResetToken();

  // since the validators will run and give error for passwordConfirm field, give option false
  await user.save({ validateBeforeSave: false });

  const resetTokenUrl = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/users/resetPassword/${pwdResetToken}`;

  res.status(200).json({
    status: 'success',
    message:
      'Token sent to email. Reset token valid for 10mins',
    data: {
      resetTokenUrl,
      token: pwdResetToken,
    },
  });
});

// RESET PASSWORD
exports.resetPassword = catchAsync(async function (
  req,
  res,
  next
) {
  // 1) get the token from the url params, and then get the user
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  // 2  get the user from the database using the hashed token
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() }, // check if the token has expired
  }).select('+password');

  if (!user) {
    return next(
      new AppError('Token is invalid or expired', 400)
    );
  }

  // 3) update the password, changedPasswordAt property and save the user

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;

  const updatedUser = await user.save();

  res.status(200).json({
    status: 'success',
    message:
      'Password reset successful. Please login again',
    data: {
      updatedUser,
    },
  });
});

// Update New Passowrd

exports.updatePassword = catchAsync(async function (
  req,
  res,
  next
) {
  const user = await User.findById(
    req.currentUser._id
  ).select('+password');

  if (
    !(await user.checkPassword(
      req.body.currentPassword,
      user.password
    ))
  ) {
    return next(
      new AppError('Incorrect current password', 401)
    );
  }

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;

  const updatedUser = await user.save();

  res.status(200).json({
    status: 'success',
    message: 'Password updated successfully',
    data: {
      updatedUser,
    },
  });
});
