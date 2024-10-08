import { Ride } from '~/lib/types';
import RideCard from './rideCard';
import Carousel, {
  CarouselRenderItem,
  ICarouselInstance,
} from 'react-native-reanimated-carousel';
import { useSharedValue, withTiming } from 'react-native-reanimated';
import { Dimensions, View } from 'react-native';
import { useEffect, useRef } from 'react';

const PAGE_WIDTH = Dimensions.get('window').width;

export function RidesCarousel({
  rides,
  onSnapToItem,
}: {
  rides: Ride[];
  onSnapToItem: (index: number) => void;
}) {
  const progressValue = useSharedValue<number>(0);
  const carouselRef = useRef<ICarouselInstance>(null);

  const renderedItem: CarouselRenderItem<Ride> = ({ item }) => {
    return <RideCard item={item} />;
  };

  return (
    <Carousel
      ref={carouselRef}
      vertical={false}
      width={PAGE_WIDTH}
      height={PAGE_WIDTH * 1.6}
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
      onSnapToItem={onSnapToItem}
    />
  );
}
