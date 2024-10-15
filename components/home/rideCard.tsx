import { useState } from 'react';
import { MapPin, Clock, User, Phone, Users, CheckCircle } from '~/lib/icons';

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from '~/components/ui/card';
import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import { Ride } from '~/lib/types';
import useCoordinateToAddress from '~/hooks/useCoordinateToAddress';
import { format } from 'date-fns';
import { ActivityIndicator, Linking, View } from 'react-native';
import { Text } from '~/components/ui/text';
import { useGetPassengerQuery } from '~/store/api/userApi';
import { XCircle } from '~/lib/icons/XCircle';
import { useAppDispatch, useAppSelector } from '~/store/hooks';
import { selectCurrentDriver } from '~/store/authSlice';
import { performRideAction } from '~/store/rideSlice';
import { useDeclineRideMutation } from '~/store/api/rideApi';
import { Skeleton } from '../ui/skeleton';
import React from 'react';

function RideCard({ item }: { item: Ride }) {
  const dispatch = useAppDispatch();
  const currentDriver = useAppSelector(selectCurrentDriver);
  const pickUpAddress = useCoordinateToAddress(item.pickupLocation);
  const destinationAddress = useCoordinateToAddress(item.destination);

  const { data: passenger, isLoading: isLoadingPassenger } =
    useGetPassengerQuery(item.passengerId);
  const [declineRide] = useDeclineRideMutation();

  const [declineButtonState, setDeclineButtonState] = useState<
    'idle' | 'loading' | 'success' | 'error'
  >('idle');
  const [rideButtonState, setRideButtonState] = useState<
    'idle' | 'loading' | 'success' | 'error'
  >('idle');
  const [error, setError] = useState<string | null>(null);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-500';
      case 'accepted':
        return 'bg-blue-500';
      case 'started':
        return 'bg-green-500';
      case 'picked-up':
        return 'bg-purple-500';
      case 'dropped-off':
        return 'bg-gray-500';
      case 'declined':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const onDeclineRide = async (rideId: string) => {
    setError(null);
    try {
      setDeclineButtonState('loading');
      await declineRide({
        id: rideId,
        driverId: currentDriver?.driverId || '',
      }).unwrap();
      setDeclineButtonState('success');
    } catch (error) {
      console.log('decline error', error);
      setDeclineButtonState('error');
      setTimeout(() => {
        setDeclineButtonState('idle');
      }, 2000);
    }
  };

  const handleRideAction = async () => {
    try {
      setRideButtonState('loading');
      setError(null);
      await dispatch(
        performRideAction({
          rideId: item.id,
          currentStatus: item.status,
          driverId: currentDriver?.driverId || '',
        })
      ).unwrap();
      setRideButtonState('success');
      setTimeout(() => {
        setRideButtonState('idle');
      }, 1000);
    } catch (error) {
      console.log('ride action error', error);
      setRideButtonState('error');
      setError((error as Error).message);
      setTimeout(() => {
        setRideButtonState('idle');
      }, 2000);
    }
  };
  const getButtonText = () => {
    switch (item.status) {
      case 'pending':
        return 'Accept Ride';
      case 'accepted':
        return 'Start Ride';
      case 'started':
        return 'Pick Up Passenger';
      case 'picked-up':
        return 'Complete Ride';
      case 'dropped-off':
        return 'Ride Completed';
      default:
        return 'N/A';
    }
  };
  const getButtonBackgroundColor = (buttonState: string) => {
    switch (buttonState) {
      case 'idle':
        return '';
      case 'loading':
        return '';
      case 'error':
        return 'bg-red-500';
      case 'success':
        return 'bg-green-500';
      case 'decline':
        return 'bg-red-500';
    }
  };

  const isButtonDisabled = (buttonState: string) => {
    return (
      buttonState !== 'idle' ||
      item.status === 'dropped-off' ||
      item.status === 'declined'
    );
  };

  const handleCall = () => {
    if (passenger?.phone) {
      Linking.openURL(`tel:${passenger.phone}`);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xl font-bold">
          Ride Details: {item.id.split('-')[0]}
        </CardTitle>
        <Badge className={`${getStatusColor(item.status)} text-white`}>
          <Text>
            {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
          </Text>
        </Badge>
      </CardHeader>
      <CardContent>
        <View className="gap-4">
          <View className="flex-row items-start gap-2">
            <MapPin className="h-5 w-5 text-green-500" />
            <Text className="font-medium">Pickup:</Text>
            <Text className="flex-shrink" numberOfLines={2}>
              {pickUpAddress?.formattedAddress}
            </Text>
          </View>
          <View className="flex-row items-start gap-2">
            <MapPin className="h-5 w-5 text-red-500" />
            <Text className="font-medium">Drop-off:</Text>
            <Text className="flex-shrink" numberOfLines={2}>
              {destinationAddress?.formattedAddress}
            </Text>
          </View>
          <View className="flex-row items-center space-x-2 gap-2">
            <Clock className="h-4 w-4 text-blue-500" />
            <Text className="font-medium">Pickup Time:</Text>
            <Text>
              {format(new Date(item.pickupTime), 'MMM d, yyyy HH:mm')}
            </Text>
          </View>
          {isLoadingPassenger ? (
            <Skeleton className="flex-1 h-4" />
          ) : (
            <View className="flex-row justify-between items-center">
              <View className="flex-row items-center space-x-2 gap-2">
                <User className="h-5 w-5 text-gray-500" />
                <Text className="font-medium">
                  {passenger?.name ?? 'Anonymous'}
                </Text>
              </View>
              <View className="flex-row items-center space-x-2 gap-2">
                <Users className="h-4 w-4 text-gray-500" />
                <Text className="font-medium">Passengers:</Text>
                <Text>{passenger?.numOfPassengers ?? 'N/A'}</Text>
              </View>
            </View>
          )}
        </View>
      </CardContent>
      <CardFooter>
        <View className="w-full flex-row items-center gap-4">
          {item.status === 'accepted' && (
            <Button
              variant="secondary"
              onPress={handleCall}
              disabled={!passenger?.phone}
              className="flex-none w-[100px]">
              <View className="flex-row justify-center items-center gap-4">
                <Phone className="h-4 w-4 text-gray-500" />
                <Text>Call</Text>
              </View>
            </Button>
          )}
          {(item.status === 'pending' || item.status === 'declined') && (
            <Button
              variant="secondary"
              disabled={isButtonDisabled(declineButtonState)}
              onPress={() => onDeclineRide(item.id)}
              className={`flex-none bg-red-500 ${
                item.status === 'declined' ? 'w-full' : 'w-[100px]'
              }`}>
              <View className="flex-row justify-center items-center">
                {declineButtonState === 'idle' && (
                  <Text className="font-semibold text-white">Decline</Text>
                )}
                {declineButtonState === 'success' && (
                  <Text className="font-semibold text-white">Declined</Text>
                )}
                {declineButtonState === 'error' && (
                  <Text className="font-semibold text-white">Retry</Text>
                )}
                {declineButtonState === 'loading' && (
                  <ActivityIndicator size="small" color="white" />
                )}
              </View>
            </Button>
          )}
          {item.status !== 'declined' && (
            <Button
              onPress={handleRideAction}
              disabled={isButtonDisabled(rideButtonState)}
              className={`flex-1 h-12 justify-center items-center text-white ${getButtonBackgroundColor(rideButtonState)} disabled:opacity-50`}>
              {rideButtonState === 'idle' && (
                <Text className="font-semibold">
                  {error ? 'Retry' : getButtonText()}
                </Text>
              )}
              {rideButtonState === 'loading' && (
                <ActivityIndicator size="small" color="white" />
              )}
              {rideButtonState === 'success' && (
                <View className="flex-row items-center">
                  <CheckCircle className="mr-2 h-5 w-5 text-white" />
                  <Text className="font-semibold text-white">Success</Text>
                </View>
              )}
              {rideButtonState === 'error' && (
                <View className="flex-row items-center">
                  <XCircle className="mr-2 h-5 w-5 text-white" />
                  <Text className="font-semibold text-white">
                    {error || 'Error'}
                  </Text>
                </View>
              )}
            </Button>
          )}
        </View>
      </CardFooter>
    </Card>
  );
}

export default React.memo(RideCard);
