import { useEffect, useState } from 'react';
import * as Location from 'expo-location';
import { Region } from 'react-native-maps';

export default function useLocation() {
  const [region, setRegion] = useState<Region>();
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const getLocation = async () => {
      setIsLoading(true);
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setErrorMsg('Permission to access location was denied');
          return;
        }

        let location = await Location.getCurrentPositionAsync({});

        setRegion({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        });
      } catch (error) {
        // setErrorMsg(
        //   'Failed to get current location. Please ensure location services are enabled.'
        // );
        // console.error('Error getting location:', error);
      } finally {
        setIsLoading(false);
      }
    };

    getLocation();
  }, []);

  return { region, setRegion, errorMsg, setErrorMsg, isLoading };
}
