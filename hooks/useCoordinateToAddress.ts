import { useEffect, useState } from 'react';
import { LatLng } from 'react-native-maps';
import * as Location from 'expo-location';

const useCoordinateToAddress = (location: LatLng, forceFetch?: boolean) => {
  const [address, setAddress] =
    useState<Location.LocationGeocodedAddress | null>(null);
  const fetchAddress = async (location: LatLng) => {
    if (location.latitude && location.longitude) {
      try {
        const [resAddress] = await Location.reverseGeocodeAsync({
          latitude: location.latitude,
          longitude: location.longitude,
        });
        setAddress(resAddress || null);
      } catch (error) {
        if (!forceFetch) {
          setAddress(null);
        }
        console.log(error);
      }
    }
  };
  useEffect(() => {
    fetchAddress(location);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location]);

  return address;
};

export default useCoordinateToAddress;
