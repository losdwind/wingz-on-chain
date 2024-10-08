import { View } from 'react-native';
import { SharedValue } from 'react-native-reanimated';

import { Ride } from '~/lib/types';

import { PaginationItem } from './CarouselPaginationItem';

export default function CarouselPagination(
  rides: Ride[],
  progressValue: SharedValue<number>
) {
  return (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: 100,
        alignSelf: 'center',
      }}>
      {rides.map((ride, index) => {
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
  );
}
