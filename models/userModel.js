const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

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
});

// Hash the password before saving it to the database
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    // return if the password in not modified
    return next();
  }

  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined; // remove passwordConfirm field
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

const User = mongoose.model('User', userSchema);

module.exports = User;
