const express = require('express');
const bookingController = require('../controllers/bookingController');
const authController = require('../controllers/authController');

// by default routter has access to params of specific route. To get access to
// params from other routers, we need to merge params
const router = express.Router({ mergeParams: true });

router.use(authController.protect);

router.get('/checkout-session/:tourId', bookingController.getCheckoutSession);

router.use(authController.restrictTo('admin', 'lead-guide'));

router
  .route('/')
  .get(bookingController.getAllBookings)
  .post(bookingController.createBooking);

router
  .route('/:id')
  .get(bookingController.getBooking)
  .patch(bookingController.updateBooking)
  .delete(bookingController.deleteBooking);

module.exports = router;
