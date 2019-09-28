import axios from 'axios';

import { showAlert } from './alerts';

export const login = async (email, password) => {
  try {
    const res = await axios({
      method: 'POST',
      url: '/api/v1/users/login',
      data: {
        email: email,
        password: password
      }
    });
    if (res.data.status === 'success') {
      showAlert('success', 'Logged in successfully!');
      window.setTimeout(() => {
        location.assign('/');
      }, 1500);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};

export const logout = async () => {
  try {
    showAlert('success', 'Logging Out...');
    const res = await axios({
      method: 'GET',
      url: '/api/v1/users/logout'
    });

    if (res.data.status === 'success') {
      window.setTimeout(() => {
        location.assign('/');
        showAlert('success', 'Logged out successfully!');
      }, 1500);
    }

    // should not really happen
  } catch (err) {
    console.log(err.response);
    showAlert('error', 'Error logging out! Try again');
  }
};
