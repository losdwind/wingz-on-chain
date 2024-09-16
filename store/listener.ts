import { addListener, createListenerMiddleware } from '@reduxjs/toolkit';
import { AppDispatch, RootState } from './store';
import { api } from './api';

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
    matcher: api.endpoints.acceptRide.matchFulfilled,
    effect: async (action, listenerApi) => {
      console.log('ride accepted');
    },
  });
};

rideAcceptListeners(startAppListening);
