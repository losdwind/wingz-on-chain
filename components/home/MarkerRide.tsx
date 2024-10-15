import React from 'react';
import { Marker } from 'react-native-maps';
import { MapViewRoute } from 'react-native-maps-routes';
import { Ride } from '~/lib/types';

export function MarkerRide({
  ride,
  isShowingRoutes,
}: {
  ride: Ride;
  isShowingRoutes: boolean;
}) {
  return (
    <>
      <Marker
        key={ride.id + 'pickup'}
        coordinate={ride.pickupLocation}
        title={`${ride.pickupLocation.latitude} ${ride.pickupLocation.longitude}`}
        description={`${ride.pickupLocation}\n${ride.passengerId}`}
        opacity={isShowingRoutes ? 1 : 0.2}
      />
      <Marker
        key={ride.id + 'destination'}
        coordinate={ride.destination}
        title={`${ride.destination.latitude} ${ride.destination.longitude}`}
        description={`${ride.destination}\n${ride.passengerId}`}
        pinColor="blue"
        opacity={isShowingRoutes ? 1 : 0.2}
      />

      {isShowingRoutes && (
        <MapViewRoute
          key={ride.id + 'route'}
          origin={ride.pickupLocation}
          destination={ride.destination}
          apiKey={process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY ?? ''}
          mode="DRIVE"
          onError={(error) => console.log(error.toString())}
        />
      )}
    </>
  );
}
