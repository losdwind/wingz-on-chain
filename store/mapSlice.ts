import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import * as Location from 'expo-location';
import { Region } from 'react-native-maps';
import { AppThunk, RootState } from './store';
import { rideApi } from './api/rideApi';

export interface MapState {
  region: Region | undefined;
  location: Location | undefined;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  errorMsg: string | null;
}
const initialState: MapState = {
  region: undefined,
  location: undefined,
  status: 'idle',
  errorMsg: null,
};

export const fetchLocation = createAsyncThunk(
  'location/fetchLocation',
  async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      throw new Error('Permission to access location was denied');
    }

    const location = await Location.getCurrentPositionAsync({});
    return {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      latitudeDelta: 0.05,
      longitudeDelta: 0.05,
    };
  }
);

export const mapSlice = createSlice({
  name: 'map',
  initialState,
  reducers: {
    setRegion(state, action: PayloadAction<Region>) {
      state.region = action.payload;
    },
    setLocation(state, action: PayloadAction<Location>) {
      state.location = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchLocation.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchLocation.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.region = action.payload;
      })
      .addCase(fetchLocation.rejected, (state, action) => {
        state.status = 'failed';
        state.errorMsg = action.error.message || 'Failed to fetch location';
      });
  },
});

export const { setRegion, setLocation } = mapSlice.actions;

// New thunk to set region and get rides
export const setRegionAndGetRides =
  (region: Region): AppThunk =>
  async (dispatch) => {
    dispatch(setRegion(region));
    dispatch(rideApi.endpoints.getRides.initiate(region));
  };

export const selectRegion = (state: RootState) => state.map.region;
export const selectLocation = (state: RootState) => state.map.location;
export default mapSlice.reducer;
