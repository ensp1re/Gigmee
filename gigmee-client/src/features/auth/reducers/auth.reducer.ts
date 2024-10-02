import { createSlice, Slice } from '@reduxjs/toolkit';
import {
  IAuthUser,
  IReduxAddAuthUser,
} from 'src/features/auth/interfaces/auth.interface';
import { initialAuthUserValues } from 'src/shared/utils/static-data';

const initialValue: IAuthUser = initialAuthUserValues as IAuthUser;

const authSlice: Slice = createSlice({
  name: 'auth',
  initialState: initialValue,
  reducers: {
    addAuthUser: (state: IAuthUser, action: IReduxAddAuthUser): IAuthUser => {
      const { authInfo } = action.payload;
      state = { ...authInfo } as unknown as IAuthUser;
      return state;
    },
    clearAuthUser: (): IAuthUser => {
      return initialValue;
    },
  },
});

export const { addAuthUser, clearAuthUser } = authSlice.actions;
export default authSlice.reducer;
