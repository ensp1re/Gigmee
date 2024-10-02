import { Dispatch } from '@reduxjs/toolkit';
import { NavigateFunction } from 'react-router-dom';
import { logout } from '../reducers/logout.reducer';
import {
  deleteFromLocalStorage,
  getDataFromSessionStorage,
  saveToSessionStorage,
} from 'src/shared/utils/utils.service';
import { authApi } from '../service/auth.service';
import { api } from 'src/store/api';

export const applicationLogout = (
  dispatch: Dispatch,
  navigate: NavigateFunction,
): void => {
  const loggedInUsername: string = getDataFromSessionStorage('loggedInUser');
  dispatch(logout({}));
  if (loggedInUsername) {
    dispatch(
      authApi.endpoints.removeLoggedInUser.initiate(`${loggedInUsername}`, {
        track: false,
      }) as never,
    );
  }
  dispatch(api.util.resetApiState());
  dispatch(authApi.endpoints.logout.initiate() as never);
  saveToSessionStorage(JSON.stringify(false), '');
  deleteFromLocalStorage('becomeASeller');
  navigate('/');
};
