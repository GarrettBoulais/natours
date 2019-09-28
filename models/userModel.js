const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

// name, email, photo, password, passwordConfirm
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'please enter your name']
  },
  email: {
    type: String,
    required: [true, 'please enter your email'],
    unique: true,
    lowercase: true, // transforms email to lowercase
    validate: [validator.isEmail, 'please enter a valid email']
  },
  photo: {
    type: String,
    default: 'default.jpg'
  },
  role: {
    type: String,
    enum: ['user', 'guide', 'lead-guide', 'admin'],
    default: 'user'
  },
  password: {
    type: String,
    required: [true, 'please enter a password'],
    minlength: [8, 'password must be at least 8 characters'],
    select: false
  },
  passwordConfirm: {
    type: String,
    required: [true, 'please confirm your password'],
    validate: {
      // This only works on CREATE and SAVE!!!!!
      validator: function(el) {
        return el === this.password;
      },
      message: 'passwords are not the same'
    }
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  active: {
    type: Boolean,
    default: true,
    select: false // dont show in output
  }
});

// mongoose middleware
userSchema.pre('save', async function(next) {
  // Only run this function if password was actually modified
  if (!this.isModified('password')) return next();
  // hash password with cost of 12
  this.password = await bcrypt.hash(this.password, 12);
  // only neede for initial signup, dont need this field anymore
  this.passwordConfirm = undefined;
  next(); // never forget!!
});

userSchema.pre('save', function(next) {
  // if we didnt modify the password then do nothing
  if (!this.isModified('password') || this.isNew) return next();

  // - 1000ms to make sure token was not created before
  this.passwordChangedAt = Date.now() - 1000;
  next();
});

userSchema.pre(/^find/, function(next) {
  // this points to the current query
  // only display active users
  this.find({ active: { $ne: false } });
  next();
});

// instance method
userSchema.methods.correctPassword = async function(
  candidatePassword,
  userPassword
) {
  // candidatePassword is not hashed, userPassword is hashed
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function(JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    return JWTTimestamp < changedTimestamp;
  }

  // false means not changed
  return false;
};

userSchema.methods.createPasswordResetToken = function() {
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // console.log({ resetToken }, this.passwordResetToken);
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

  // return unencrypted reset token
  return resetToken;
};

const User = new mongoose.model('User', userSchema);

module.exports = User;
