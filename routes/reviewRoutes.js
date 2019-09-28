const express = require('express');
const reviewController = require('../controllers/reviewController');
const authController = require('../controllers/authController');
const bookingController = require('../controllers/bookingController');

// by default routter has access to params of specific route. To get access to
// params from other routers, we need to merge params
const router = express.Router({ mergeParams: true });

// need to be logged in to access reviews
router.use(authController.protect);

router
  .route('/')
  .get(reviewController.getAllReviews)
  .post(
    authController.restrictTo('user'),
    reviewController.setTourUserIds,
    reviewController.checkIfBooked,
    reviewController.checkDuplicates,
    reviewController.createReview
  );

router
  .route('/:id')
  .get(reviewController.getReview)
  .patch(reviewController.updateReview)
  .delete(reviewController.deleteReview);

router
  .route('/:id')
  .patch(
    authController.restrictTo('user', 'admin'),
    reviewController.updateReview
  )
  .delete(
    authController.restrictTo('user', 'admin'),
    reviewController.deleteReview
  );

module.exports = router;
