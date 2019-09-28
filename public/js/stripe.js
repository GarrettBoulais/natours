import { showAlert } from './alerts';

import axios from 'axios';
const stripe = Stripe('pk_test_9oO20oDtQUCTTOz6uFyEWzCS002dZsrwth');

export const bookTour = async tourId => {
  try {
    // 1) Get the checkout session from the API
    const session = await axios(`/api/v1/bookings/checkout-session/${tourId}`);
    // console.log(session);

    // 2) Create checkout form + charge the credit card
    await stripe.redirectToCheckout({
      sessionId: session.data.session.id
    });
  } catch (err) {
    console.log(err);
    showAlert('error', err);
  }
};
