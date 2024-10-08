import { Region } from 'react-native-maps';
import { baseApi } from './baseApi';
interface Ride {
  id: string;
  PassengerId: string;
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

export const rideApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getRides: builder.query<Ride[], Region>({
      onQueryStarted: async (arg, { dispatch, queryFulfilled }) => {
        try {
          await queryFulfilled; // Wait for the query to fulfill
        } catch (error) {
          console.error('getRides query failed', error);
        }
      },
      query: (region) => ({
        url: '/rides',
        params: region,
      }),
      providesTags: (result = [], error, arg) => [
        'Ride',
        ...result.map(({ id }) => ({ type: 'Ride', id }) as const),
      ],
      transformResponse: (response: { rides: Ride[] }) => {
        console.log('rides', response.rides);
        return response.rides;
      },
    }),
    getRide: builder.query<Ride, string>({
      query: (id) => `/rides/${id}`,
      providesTags: (result, error, id) => [{ type: 'Ride', id }],
    }),

    getOrderHistory: builder.query<Ride[], Ride['status']>({
      query: (status) => `/rides/orderHistory?status=${status}`,
      providesTags: (result = [], error, arg) => [
        'Ride',
        ...result.map(({ id }) => ({ type: 'Ride', id }) as const),
      ],
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
      transformResponse: (response: { ride: Ride }) => {
        return response.ride;
      },
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
      transformResponse: (response: { ride: Ride }) => {
        return response.ride;
      },
      invalidatesTags: (result, error, { id }) => [
        { type: 'Ride', id },
        'Ride',
      ],
    }),
  }),
});

export const {
  useGetRidesQuery,
  useGetRideQuery,
  useAcceptRideMutation,
  useUpdateRideStatusMutation,
  useGetOrderHistoryQuery,
} = rideApi;
