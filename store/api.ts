import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import Constants from 'expo-constants';
interface Ride {
  id: string;
  userId: string;
  driverId: string | null;
  pickupLocation: { latitude: number; longitude: number };
  destination: { latitude: number; longitude: number };
  status:
    | 'pending'
    | 'accepted'
    | 'declined'
    | 'started'
    | 'picked-up'
    | 'dropped-off';
  pickupTime: string;
  timestamp: string;
}

export const api = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: 'http://example.com/api',
  }),
  tagTypes: ['Ride'],
  endpoints: (builder) => ({
    getRides: builder.query<Ride[], void>({
      onQueryStarted: async (arg, { dispatch, queryFulfilled }) => {
        console.log('getRides triggered');
        try {
          await queryFulfilled; // Wait for the query to fulfill
        } catch (error) {
          console.error('getRides query failed', error);
        }
      },
      query: () => '/rides',
      providesTags: ['Ride'],
      transformResponse: (response: Ride[]) => {
        return response;
      },
    }),
    getRide: builder.query<Ride, string>({
      query: (id) => `/rides/${id}`,
      providesTags: (result, error, id) => [{ type: 'Ride', id }],
    }),
    acceptRide: builder.mutation<Ride, { id: string; driverId: string }>({
      query: ({ id, driverId }) => ({
        url: `/rides/${id}/accept`,
        method: 'POST',
        body: { driverId },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Ride', id },
        'Ride',
      ],
    }),
    updateRideStatus: builder.mutation<
      Ride,
      { id: string; status: Ride['status'] }
    >({
      query: ({ id, status }) => ({
        url: `/rides/${id}/status`,
        method: 'PATCH',
        body: { status },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Ride', id },
        'Ride',
      ],
    }),
    createRide: builder.mutation<Ride, void>({
      query: () => ({
        url: 'rides',
        method: 'POST',
      }),
      invalidatesTags: ['Ride'],
    }),
  }),
});

export const {
  useGetRidesQuery,
  useGetRideQuery,
  useAcceptRideMutation,
  useUpdateRideStatusMutation,
  useCreateRideMutation,
} = api;
