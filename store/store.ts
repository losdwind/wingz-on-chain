import { listenerMiddleware } from './listener';
import mapReducer from './mapSlice';
import authReducer from './authSlice';
import rideReducer from './rideSlice';
import { Action, configureStore, ThunkAction } from '@reduxjs/toolkit';
import { baseApi as api } from './api/baseApi';
import devToolsEnhancer from 'redux-devtools-expo-dev-plugin';
export const store = configureStore({
  reducer: {
    [api.reducerPath]: api.reducer,
    map: mapReducer,
    auth: authReducer,
    ride: rideReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .prepend(listenerMiddleware.middleware)
      .concat(api.middleware),
  devTools: false,
  enhancers: (getDefaultEnhancers) =>
    getDefaultEnhancers().concat(devToolsEnhancer() as any),
});

// Infer the type of `store`
export type AppStore = typeof store;
// Infer the `AppDispatch` type from the store itself
export type AppDispatch = typeof store.dispatch;
// Same for the `RootState` type
export type RootState = ReturnType<typeof store.getState>;
// Export a reusable type for handwritten thunks
export type AppThunk = ThunkAction<void, RootState, unknown, Action>;
