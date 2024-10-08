import { addListener, createListenerMiddleware } from '@reduxjs/toolkit';
import { AppDispatch, RootState } from './store';
import { rideApi } from './api/rideApi';

export const listenerMiddleware = createListenerMiddleware();

export const startAppListening = listenerMiddleware.startListening.withTypes<
  RootState,
  AppDispatch
>();

export const addAppListener = addListener.withTypes<RootState, AppDispatch>();

export type AppStartListening = typeof startAppListening;
export type AppAddListener = typeof addAppListener;

export const rideAcceptListeners = (startAppListening: AppStartListening) => {
  startAppListening({
    matcher: rideApi.endpoints.acceptRide.matchFulfilled,
    effect: async (action, listenerApi) => {
      const ride = action.payload;
      console.log('ongoing ride', ride);
    },
  });
};

rideAcceptListeners(startAppListening);
