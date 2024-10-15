import React, { useRef, useState } from 'react';
import { View, Dimensions } from 'react-native';

import MapView, {
  Details,
  PROVIDER_GOOGLE,
  Region,
  UserLocationChangeEvent,
} from 'react-native-maps';
import { StyleSheet } from 'react-native';
import { useGetRidesQuery } from '~/store/api/rideApi';
import { Ride } from '~/lib/types';
import useLocation from '~/hooks/useLocation';
import { useColorScheme } from '~/lib/useColorScheme';
import { nightMapTheme } from '~/lib/nightMapTheme';
import { useAppSelector } from '~/store/hooks';
import { selectOngoingRides } from '~/store/rideSlice';
import { MarkerRide } from '~/components/home/MarkerRide';
import { RidesCarousel } from '~/components/home/RidesCarousel';
import { Skeleton } from '~/components/ui/skeleton';
import { ErrorMessage } from '~/components/home/ErrorMessage';

const PAGE_WIDTH = Dimensions.get('screen').width;
const emptyArray: Ride[] = [];

export default function HomeScreen() {
  const { isDarkColorScheme } = useColorScheme();
  const { region, errorMsg } = useLocation();
  const [currentRide, setCurrentRide] = useState<Ride>();
  const mapRef = useRef<MapView>(null);
  const [lastManualRegionChangeTimestamp, setLastManualRegionChangeTimestamp] =
    useState<number>(Date.now());
  const [queryRidesRegion, setQueryRidesRegion] = useState<Region>();
  const {
    rides,
    isLoading,
    isUninitialized,
    isError: isQueryRidesError,
    refetch,
  } = useGetRidesQuery(queryRidesRegion!, {
    skip: !queryRidesRegion,
    selectFromResult: (result) => {
      return {
        rides: result.data ?? emptyArray,
        isLoading: result.isLoading,
        isUninitialized: result.isUninitialized,
        isError: result.isError,
      };
    },
  });
  const ongoingRides = useAppSelector(selectOngoingRides);
  const ridesToDisplay = (
    ongoingRides.length > 0 ? ongoingRides : rides
  ) as Ride[];

  const onRegionChangeComplete = (region: Region, gesture: Details) => {
    setQueryRidesRegion(region);
    setLastManualRegionChangeTimestamp(Date.now());
  };

  const onUserLocationChange = (event: UserLocationChangeEvent) => {
    if (Date.now() - lastManualRegionChangeTimestamp < 10000) {
      return;
    }
    const { coordinate } = event.nativeEvent;
    mapRef.current?.animateToRegion({
      latitude: coordinate!.latitude,
      longitude: coordinate!.longitude,
      latitudeDelta: 0.0922,
      longitudeDelta: 0.0421,
    });
  };

  const onSnapToItem = (index: number) => {
    setCurrentRide(rides[index]);
    fitToRide(index);
  };

  const fitToRide = (index: number) => {
    if (!rides) return;
    mapRef.current?.fitToCoordinates(getCurrentSRideRoute(rides[index]), {
      edgePadding: {
        top: 50,
        right: 50,
        bottom: 50 + PAGE_WIDTH,
        left: 50,
      },
      animated: true,
    });
  };

  const getCurrentSRideRoute = (ride: Ride) => {
    return [ride.pickupLocation, ride.destination];
  };

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        region={region}
        customMapStyle={isDarkColorScheme ? nightMapTheme : []}
        showsMyLocationButton={true}
        showsUserLocation={true}
        followsUserLocation={true}
        onUserLocationChange={onUserLocationChange}
        onRegionChangeComplete={onRegionChangeComplete}>
        {ridesToDisplay.length > 0 &&
          ridesToDisplay.map((ride) => (
            <MarkerRide
              key={ride.id}
              ride={ride}
              isShowingRoutes={ride.id === currentRide?.id}
            />
          ))}
      </MapView>
      {errorMsg && <ErrorMessage message={errorMsg} />}
      {isQueryRidesError && (
        <ErrorMessage
          message="We couldn't load the rides. Please check your internet connection and try again."
          onRetry={refetch}
        />
      )}
      {!isLoading &&
        !isQueryRidesError &&
        !isUninitialized &&
        rides.length === 0 && (
          <ErrorMessage
            message="No ride orders available near your location. Try adjusting the map or check back later."
            onRetry={refetch}
          />
        )}
      <View style={styles.itemsContainer}>
        {isLoading ? (
          <Skeleton />
        ) : ridesToDisplay.length > 0 ? (
          <RidesCarousel rides={ridesToDisplay} onSnapToItem={onSnapToItem} />
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  itemsContainer: {
    backgroundColor: 'transparent',
    position: 'absolute',
    marginTop: 400,
  },
  map: {
    width: '100%',
    height: '100%',
  },

  loadingContainer: {
    position: 'absolute',
    top: 100,
    left: 60,
    right: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: 'bold',
  },
});
