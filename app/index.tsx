import React, { useRef, useState } from 'react';
import { View, Dimensions } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE, Region } from 'react-native-maps';
import { StyleSheet } from 'react-native';
import { initialRegion, Ride } from '~/mock/handlers';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '~/components/ui/card';
import { Text } from '~/components/ui/text';
import Carousel, {
  CarouselRenderItem,
  ICarouselInstance,
} from 'react-native-reanimated-carousel';
import Animated, {
  Extrapolate,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import { MapViewRoute } from 'react-native-maps-routes';
import { rides } from '~/mock/handlers';

const PAGE_WIDTH = Dimensions.get('screen').width;

export default function HomeScreen() {
  const [region, setRegion] = useState(initialRegion);
  const [currentRide, setCurrentRide] = useState<Ride>();
  const progressValue = useSharedValue<number>(0);
  const carouselRef = useRef<ICarouselInstance>(null);
  const mapRef = useRef<MapView>(null);

  const onRegionChangeComplete = (region: Region) => {
    setRegion(region);
  };

  const getCurrentSRideRoute = (ride: Ride) => {
    return [ride.pickupLocation, ride.destination];
  };

  const fitToRide = (index: number) => {
    mapRef.current?.fitToCoordinates(getCurrentSRideRoute(rides[index]), {
      edgePadding: {
        top: 20,
        right: 20,
        bottom: 20 + PAGE_WIDTH * 0.6,
        left: 20,
      },
      animated: true,
    });
  };

  return (
    <View style={styles.container}>
      // Map View
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        region={region}
        showsUserLocation={true}
        followsUserLocation={true}
        onRegionChangeComplete={onRegionChangeComplete}>
        {rides.map((ride, index) => (
          <Marker
            key={ride.id}
            coordinate={ride.pickupLocation}
            title={ride.pickupTime}
            description={ride.pickupLocation + '/n' + ride.userId}
          />
        ))}
        {rides.map((ride, index) => (
          <Marker
            key={ride.id}
            coordinate={ride.destination}
            title={ride.pickupTime}
            description={ride.destination + '/n' + ride.userId}
            pinColor="blue"
          />
        ))}
        {currentRide && (
          <MapViewRoute
            origin={currentRide.pickupLocation}
            destination={currentRide.destination}
            apiKey={'AIzaSyA4vZo6eMHhPQCyhzb3l7LiEo2mZZBK2UY'}
            mode="DRIVE"
            onError={(error) => console.log(error.toString())}
          />
        )}
      </MapView>
      <View style={styles.itemsContainer}>
        <Carousel
          ref={carouselRef}
          vertical={false}
          width={PAGE_WIDTH}
          height={PAGE_WIDTH * 0.6}
          loop={false}
          pagingEnabled={true}
          snapEnabled={true}
          autoPlay={false}
          autoPlayInterval={1500}
          onProgressChange={(_, absoluteProgress) =>
            (progressValue.value = absoluteProgress)
          }
          mode="parallax"
          modeConfig={{
            parallaxScrollingScale: 0.9,
            parallaxScrollingOffset: 50,
          }}
          data={rides}
          renderItem={renderedItem}
          onSnapToItem={(index) => {
            setCurrentRide(rides[index]);
            fitToRide(index);
          }}
        />
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            width: 100,
            alignSelf: 'center',
          }}>
          {rides &&
            rides.map((ride, index) => {
              return (
                <PaginationItem
                  backgroundColor={'gray'}
                  animValue={progressValue}
                  index={index}
                  key={index}
                  isRotate={false}
                  length={rides.length}
                />
              );
            })}
        </View>
      </View>
    </View>
  );
}

const renderedItem: CarouselRenderItem<Ride> = ({ item }) => {
  return (
    <Card key={item.id}>
      <CardHeader>
        <CardTitle>Ride Order</CardTitle>
        <CardDescription>Card Description</CardDescription>
      </CardHeader>
      <CardContent>
        <Text>{item.userId}</Text>
        <Text>{item.pickupLocation.toString()}</Text>

        <Text>{item.pickupTime}</Text>
        <Text>{item.destination.toString()}</Text>
      </CardContent>
      <CardFooter>
        <Text>Status: {item.status}</Text>
      </CardFooter>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  itemsContainer: {
    backgroundColor: 'transparent',
    position: 'absolute',
    paddingTop: 450,
  },
  map: {
    width: '100%',
    height: '100%',
  },
});

const PaginationItem: React.FC<{
  index: number;
  backgroundColor: string;
  length: number;
  animValue: Animated.SharedValue<number>;
  isRotate?: boolean;
}> = (props) => {
  const { animValue, index, length, backgroundColor, isRotate } = props;
  const width = 10;

  const animStyle = useAnimatedStyle(() => {
    let inputRange = [index - 1, index, index + 1];
    let outputRange = [-width, 0, width];

    if (index === 0 && animValue?.value > length - 1) {
      inputRange = [length - 1, length, length + 1];
      outputRange = [-width, 0, width];
    }

    return {
      transform: [
        {
          translateX: interpolate(
            animValue?.value,
            inputRange,
            outputRange,
            Extrapolate.CLAMP
          ),
        },
      ],
    };
  }, [animValue, index, length]);
  return (
    <View
      style={{
        backgroundColor: 'white',
        width,
        height: width,
        borderRadius: 50,
        overflow: 'hidden',
        transform: [
          {
            rotateZ: isRotate ? '90deg' : '0deg',
          },
        ],
      }}>
      <Animated.View
        style={[
          {
            borderRadius: 50,
            backgroundColor,
            flex: 1,
          },
          animStyle,
        ]}
      />
    </View>
  );
};
