import axios from 'axios';
import { showAlert } from './alerts';
import { hideAlert } from './alerts';
export const login = async (email, password) => {
  //!this way is same in node exports.login
  //!only modern browser could work with sync await

  try {
    const res = await axios({
      method: 'POST',
      url: 'http://127.0.0.1:8000/api/v1/users/login',
      data: {
        email,
        password,
      },
    });
    // console.log(res);
    if (res.data.status === 'success') {
      showAlert('success', 'logged in successfully');
      window.setTimeout(() => {
        location.assign('/');
      }, 2000);
    }
  } catch (err) {
    showAlert('error', err.response.data.message); //! found in axios documentation
  }
};

export const logout = async () => {
  try {
    const res = await axios({
      method: 'GET',
      url: 'http://127.0.0.1:8000/api/v1/users/logout',
    });
    if ((res.data.status = 'success')) {
      location.reload(true);
      location.assign('/');
    } //!location.reload(true); reload from server
  } catch (err) {
    showAlert('error', 'Error logging out, try again!');
  }
};
