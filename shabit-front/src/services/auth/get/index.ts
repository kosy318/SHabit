import { header } from '../..';
import store from '../../../store';
import { setUserState } from '../../../store/authSlice';
import apiRequest from '../../../utils/apiRequest';

export const fetchProfile = async (email: string): Promise<object> => {
  return await apiRequest
    .get(`/api/v1/user/${email}`, { headers: header() })
    .then((res) => {
      const user = res.data.result;
      store.dispatch(setUserState(user));
      sessionStorage.setItem('user', JSON.stringify(user));
      return Promise.resolve(user);
    })
    .catch(async (err) => {
      const refreshToken = localStorage.getItem('refreshToken');
      const accessToken = localStorage.getItem('accessToken');
      return await apiRequest
        .post(`/api/v1/user/token`, { accessToken, refreshToken })
        .then(async (res) => {
          const { accessToken, refreshToken } = res.data.result;
          sessionStorage.setItem('user', JSON.stringify(accessToken));
          localStorage.setItem('refreshToken', JSON.stringify(refreshToken));
          localStorage.setItem('accessToken', JSON.stringify(accessToken));
          return await apiRequest
            .get(`/api/v1/user/${email}`, { headers: header() })
            .then((res) => {
              const user = res.data.result;
              store.dispatch(setUserState(user));
              sessionStorage.setItem('user', JSON.stringify(user));
              return Promise.resolve(user);
            })
            .catch((err) => Promise.reject(err));
        });
    });
};

export const confirmEmail = async (email: string): Promise<string> => {
  return await apiRequest
    .get(`api/v1/user/email-valid/${email}`)
    .then((res) => {
      return Promise.resolve(res.data.result);
    })
    .catch((err) => {
      return Promise.resolve(err);
    });
};

export const checkEmail = async (email: string): Promise<boolean> => {
  return await apiRequest
    .get(`/api/v1/user/email-check/${email}`)
    .then((res) => {
      return Promise.resolve(res);
    })
    .catch((err) => {
      return Promise.reject(err);
    });
};
