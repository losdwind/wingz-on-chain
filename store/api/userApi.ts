import { baseApi } from './baseApi';
import { Passenger, Driver } from '~/lib/types';

export const userApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getPassengers: builder.query<Passenger[], void>({
      query: () => '/passengers',
      providesTags: ['Passengers'],
      transformResponse: (response: { passengers: Passenger[] }) => {
        return response.passengers;
      },
    }),
    getDrivers: builder.query<Driver[], void>({
      query: () => '/drivers',
      providesTags: ['Drivers'],
      transformResponse: (response: { drivers: Driver[] }) => {
        console.log('response: drivers :', response.drivers);
        return response.drivers;
      },
    }),
    getPassenger: builder.query<Passenger, string>({
      query: (id) => `/passengers/${id}`,
    }),
    getDriver: builder.query<Driver, string>({
      query: (id) => `/drivers/${id}`,
    }),
    login: builder.mutation<
      | { passenger: Passenger; token: string }
      | { driver: Driver; token: string },
      { passengerId: string } | { driverId: string }
    >({
      query: (arg) => ({
        url: '/login',
        method: 'POST',
        body: arg,
      }),
    }),
    logout: builder.mutation<void, void>({
      query: () => ({
        url: '/logout',
        method: 'POST',
      }),
    }),
  }),
});

export const {
  useGetPassengersQuery,
  useGetDriversQuery,
  useGetPassengerQuery,
  useGetDriverQuery,
  useLoginMutation,
  useLogoutMutation,
} = userApi;
