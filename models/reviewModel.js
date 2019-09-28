const mongoose = require('mongoose');

const Tour = require('./tourModel');

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'Review cannot be empty']
    },
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    createdAt: {
      type: Date,
      default: Date.now()
    },
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      required: [true, 'Review must belong to a tour']
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Review must belong to a user']
    }
  },
  // Options
  // whenever there is a vitrual property (property not in database),
  // we want it to show up in the output
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// want a user to only be allowed to write one review for a single tour
reviewSchema.index({ tour: 1, user: 1 }, { unique: true });

reviewSchema.pre(/^find/, function(next) {
  // // fill review's tour with its data
  // this.populate({
  //   path: 'tour',
  //   select: 'name'
  // })
  // // fill review's user with its data
  // .populate({
  //   path: 'user',
  //   select: 'name photo'
  // });

  // fill review's user with its data
  this.populate({
    path: 'user',
    select: 'name photo'
  });

  next();
});

reviewSchema.statics.calcAverageRatings = async function(tourId) {
  // this points to model
  const stats = await this.aggregate([
    {
      $match: { tour: tourId }
    },
    {
      $group: {
        _id: '$tour', // group per tour
        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating' }
      }
    }
  ]);

  if (stats.length > 0) {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: stats[0].nRating,
      ratingsAverage: stats[0].avgRating
    });
  } else {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: 0,
      ratingsAverage: 4.5
    });
  }
};

reviewSchema.post('save', function() {
  // this points to durrent review being saved
  this.constructor.calcAverageRatings(this.tour);
});

reviewSchema.pre(/^findOneAnd/, async function(next) {
  this.review = await this.findOne(); // pass data to post middleware
  next();
});

reviewSchema.post(/^findOneAnd/, async function() {
  // this.review = await this.findOne(); //does not work, query already executed
  await this.review.constructor.calcAverageRatings(this.review.tour);
});

// create model and export!
const Review = mongoose.model('Review', reviewSchema);
module.exports = Review;
