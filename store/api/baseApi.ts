import {
  BaseQueryApi,
  createApi,
  FetchArgs,
  fetchBaseQuery,
} from '@reduxjs/toolkit/query/react';
import { RootState } from '../store';
import Toast from 'react-native-toast-message';

const baseQuery = fetchBaseQuery({
  baseUrl: 'http://example.com/api',
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth.token;
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  },
});

const baseQueryWithAuth = async (
  args: string | FetchArgs,
  api: BaseQueryApi,
  extraOptions: {}
) => {
  const result = await baseQuery(args, api, extraOptions);
  if (result.error && result.error.status === 401) {
    Toast.show({
      type: 'error',
      text1: 'Authentication Error',
      text2: 'You are not logged in',
      position: 'top',
      visibilityTime: 3000,
    });
  }
  return result;
};

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithAuth,
  tagTypes: ['Ride', 'Passenger', 'Driver'],
  endpoints: () => ({}),
});
