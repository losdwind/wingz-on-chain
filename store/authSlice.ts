import { createSlice } from '@reduxjs/toolkit';
import { userApi } from './api/userApi';
import { Driver, Passenger } from '~/lib/types';
import { RootState } from './store';
type AuthState = {
  passenger: Passenger | null;
  driver: Driver | null;
  token: string | null;
};
const initialState: AuthState = {
  passenger: null,
  driver: null,
  token: null,
};
export const authSlice = createSlice({
  name: 'auth',
  initialState: initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addMatcher(
      userApi.endpoints.login.matchFulfilled,
      (state, { payload }) => {
        console.log('payload', payload);
        if ('passenger' in payload) {
          state.passenger = payload.passenger;
          state.token = payload.token;
        } else if ('driver' in payload) {
          state.driver = payload.driver;
          state.token = payload.token;
        }
      }
    );
    builder.addMatcher(
      userApi.endpoints.logout.matchFulfilled,
      () => initialState
    );
  },
});

export default authSlice.reducer;
export const selectCurrentPassenger = (state: RootState) =>
  state.auth.passenger;
export const selectCurrentDriver = (state: RootState) => state.auth.driver;
