import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';

import { rideApi } from './api/rideApi';
import { Ride } from '~/lib/types';
import { RootState } from './store';

interface RideState {
  ongoingRides: Ride[];
}

const initialState: RideState = {
  ongoingRides: [],
};

export const performRideAction = createAsyncThunk(
  'ride/performRideAction',
  async (
    {
      rideId,
      currentStatus,
      driverId,
    }: { rideId: string; currentStatus: Ride['status']; driverId: string },
    { dispatch }
  ) => {
    try {
      const statusTransitions: Record<Ride['status'], Ride['status']> = {
        pending: 'accepted',
        accepted: 'started',
        started: 'picked-up',
        'picked-up': 'dropped-off',
        'dropped-off': 'dropped-off',
        declined: 'declined',
      };

      const newStatus = statusTransitions[currentStatus];

      if (newStatus === currentStatus) {
        throw new Error('No action available for current status');
      }

      if (newStatus === 'accepted') {
        await dispatch(
          rideApi.endpoints.acceptRide.initiate({ id: rideId, driverId })
        ).unwrap();
      } else {
        await dispatch(
          rideApi.endpoints.updateRideStatus.initiate({
            id: rideId,
            status: newStatus,
          })
        ).unwrap();
      }

      return { rideId, newStatus };
    } catch (error) {
      throw error;
    }
  }
);

export const rideSlice = createSlice({
  name: 'ride',
  initialState,
  reducers: {
    addOngoingRide: (state, action: PayloadAction<Ride>) => {
      state.ongoingRides.push(action.payload);
    },
    updateOngoingRide: (state, action: PayloadAction<Ride>) => {
      const index = state.ongoingRides.findIndex(
        (ride) => ride.id === action.payload.id
      );
      if (index !== -1) {
        state.ongoingRides[index] = action.payload;
      }
    },
    removeOngoingRide: (state, action: PayloadAction<string>) => {
      state.ongoingRides = state.ongoingRides.filter(
        (ride) => ride.id !== action.payload
      );
    },
  },
  extraReducers: (builder) => {
    builder.addMatcher(
      rideApi.endpoints.acceptRide.matchFulfilled,
      (state, action) => {
        rideSlice.caseReducers.addOngoingRide(state, {
          payload: action.payload,
          type: 'ride/addOngoingRide',
        });
      }
    );
    builder.addMatcher(
      rideApi.endpoints.updateRideStatus.matchFulfilled,
      (state, action) => {
        rideSlice.caseReducers.updateOngoingRide(state, {
          payload: action.payload,
          type: 'ride/updateOngoingRide',
        });
        if (action.payload.status === 'dropped-off') {
          rideSlice.caseReducers.removeOngoingRide(state, {
            payload: action.payload.id,
            type: 'ride/removeOngoingRide',
          });
        }
      }
    );
  },
});

export const { addOngoingRide, updateOngoingRide, removeOngoingRide } =
  rideSlice.actions;

export const selectOngoingRides = (state: RootState) => state.ride.ongoingRides;
export default rideSlice.reducer;
