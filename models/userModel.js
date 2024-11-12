const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    lowercase: true,
    unique: true,
  },
  photo: String,
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 3,
    select: false, // do not show this field in queries
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Confirm password is required'],
    validate: {
      validator: function (val) {
        // the validator will only work when creating/save new users,
        // and not when updating existing users as 'this' will refer to the query and not the document in updates
        return val === this.password;
      },
      message: 'Passwords do not match',
    },
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
});

// Hash the password before saving it to the database
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    // return if the password in not modified
    return next();
  }

  console.log('Passowrd is modified');
  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined; // remove passwordConfirm field
  next();
});

// update the passwordChangedAt if the password is changed
userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || this.isNew) {
    // return if the password in not modified and if the document is new
    return next();
  }
  console.log('Passowrd is modified and old document');

  this.passwordChangedAt = Date.now() - 5000;
  next();
});

// Instance method
userSchema.methods.checkPassword = async function (
  userPassword,
  dbPassword
) {
  const validPassowrd = await bcrypt.compare(
    userPassword,
    dbPassword
  );
  console.log(validPassowrd);
  return validPassowrd;
};

userSchema.methods.checkPasswordChangedAfterToken =
  function (JWTtimestamp) {
    if (this.passwordChangedAt) {
      const passwordChangetTime =
        this.passwordChangedAt.getTime() / 1000; // milliseconds to seconds

      if (passwordChangetTime > JWTtimestamp) {
        console.log(
          'Password changed after token. So it will be invalid token user has to login in again'
        );
        return true;
      }
    }
    return false;
  };

userSchema.methods.createPasswordResetToken =
  async function () {
    const resetToken = crypto
      .randomBytes(32)
      .toString('hex');
    this.passwordResetToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

    return resetToken;
  };

const User = mongoose.model('User', userSchema);

module.exports = User;
