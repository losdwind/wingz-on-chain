import { useEffect, useState } from 'react';
import * as Location from 'expo-location';
import { Region } from 'react-native-maps';

export default function useLocation() {
  const [region, setRegion] = useState<Region>();

  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const getLocation = async () => {
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
    };

    getLocation();
  }, []);

  return { region, setRegion, errorMsg, setErrorMsg };
}
