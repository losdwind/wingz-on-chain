import { createSlice } from '@reduxjs/toolkit';

import { rideApi } from './api/rideApi';
import { Ride } from '~/lib/types';
import { RootState } from './store';
type RideState = {
  ongoingRides: Ride[];
};
const initialState: RideState = {
  ongoingRides: [],
};
export const rideSlice = createSlice({
  name: 'ride',
  initialState: initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addMatcher(
      rideApi.endpoints.acceptRide.matchFulfilled,
      (state, action) => {
        state.ongoingRides.push(action.payload);
      }
    );
    builder.addMatcher(
      rideApi.endpoints.updateRideStatus.matchFulfilled,
      (state, action) => {
        const index = state.ongoingRides.findIndex(
          (ride) => ride.id === action.payload.id
        );
        if (index !== -1) {
          if (action.payload.status === 'dropped-off') {
            state.ongoingRides.splice(index, 1);
          } else {
            state.ongoingRides[index] = action.payload;
          }
        }
      }
    );
  },
});

export default rideSlice.reducer;
export const selectOngoingRides = (state: RootState) => state.ride.ongoingRides;
