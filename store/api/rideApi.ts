import { Region } from 'react-native-maps';
import { baseApi } from './baseApi';
import { Ride } from '~/lib/types';

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
        ...result.map(({ id }) => ({ type: 'Ride', id }) as const),
      ],
    }),
    acceptRide: builder.mutation<Ride, { id: string; driverId: string }>({
      query: ({ id, driverId }) => ({
        url: `/rides/${id}/accept`,
        method: 'POST',
        body: { driverId },
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Ride', id }],
    }),
    declineRide: builder.mutation<Ride, { id: string; driverId: string }>({
      query: ({ id, driverId }) => ({
        url: `/rides/${id}/decline`,
        method: 'POST',
        body: { driverId },
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Ride', id }],
      onQueryStarted: async (arg, { dispatch, queryFulfilled, getState }) => {
        // update the ride status to declined in the store
        const getRidePatchResult = dispatch(
          rideApi.util.updateQueryData('getRide', arg.id, (draft) => {
            return { ...draft, status: 'declined' };
          })
        );

        // TODO: get the region from the store not working

        const getRidesPatchResult = dispatch(
          rideApi.util.updateQueryData('getRides', {} as Region, (draft) => {
            return draft.map((ride) =>
              ride.id === arg.id ? { ...ride, status: 'declined' } : ride
            );
          })
        );

        try {
          await queryFulfilled;
        } catch {
          getRidePatchResult.undo();
          getRidesPatchResult.undo();
        }
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
      invalidatesTags: (result, error, { id }) => [{ type: 'Ride', id }],
    }),
  }),
});

export const {
  useGetRidesQuery,
  useGetRideQuery,
  useAcceptRideMutation,
  useDeclineRideMutation,
  useUpdateRideStatusMutation,
  useGetOrderHistoryQuery,
} = rideApi;
