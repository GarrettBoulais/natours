const factory = require('./handlerFactory');
const Review = require('../models/reviewModel');
const Booking = require('../models/bookingModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.setTourUserIds = (req, res, next) => {
  // Allow nested routes
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user.id;
  next();
};

exports.getAllReviews = factory.getAll(Review);
exports.createReview = factory.createOne(Review);
exports.getReview = factory.getOne(Review);
exports.updateReview = factory.updateOne(Review);
exports.deleteReview = factory.deleteOne(Review);

exports.checkDuplicates = catchAsync(async (req, res, next) => {
  const { tour, user } = req.body;
  const review = Review.find(tour, user);
  if (review || review.length > 0)
    return next(
      new AppError('User has already written review for this tour', 400)
    );

  next();
});

exports.checkIfBooked = catchAsync(async (req, res, next) => {
  const { tour, user } = req.body;
  const booking = await Booking.find({ tour, user });
  if (!booking || booking.length === 0)
    return next(
      new AppError('User must book this tour before writing a review', 400)
    );

  next();
});
