import { useCallback, useState } from 'react';
import {
  MapPin,
  Clock,
  Calendar,
  Timer,
  User,
  Phone,
  Users,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  Loader2,
} from '~/lib/icons';

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from '~/components/ui/card';
import { Badge } from '~/components/ui/badge';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '~/components/ui/collapsible';
import { Button } from '~/components/ui/button';
import { Ride } from '~/lib/types';
import useCoordinateToAddress from '~/hooks/useCoordinateToAddress';
import { format } from 'date-fns';
import { View } from 'react-native';
import { Text } from '~/components/ui/text';
import {
  useAcceptRideMutation,
  useUpdateRideStatusMutation,
} from '~/store/api/rideApi';
import { useGetPassengerQuery } from '~/store/api/userApi';
import { XCircle } from '~/lib/icons/XCircle';
import { useAppSelector } from '~/store/hooks';
import { selectCurrentDriver } from '~/store/authSlice';

export default function RideCard({ item }: { item: Ride }) {
  const currentDriver = useAppSelector(selectCurrentDriver);
  const [acceptRide] = useAcceptRideMutation();
  const [updateRideStatus] = useUpdateRideStatusMutation();
  const { data: passenger } = useGetPassengerQuery(item.PassengerId);
  const pickUpAddress = useCoordinateToAddress(item.pickupLocation);
  const destinationAddress = useCoordinateToAddress(item.destination);
  const [isOpen, setIsOpen] = useState(false);
  const [buttonState, setButtonState] = useState<
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

  const handleRideAction = async () => {
    try {
      if (!currentDriver) {
        throw new Error('You are not logged in');
      }
      setButtonState('loading');
      let newStatus: Ride['status'];
      switch (item.status) {
        case 'pending':
          newStatus = 'accepted';
          break;
        case 'accepted':
          newStatus = 'started';
          break;
        case 'started':
          newStatus = 'picked-up';
          break;
        case 'picked-up':
          newStatus = 'dropped-off';
          break;
        default:
          throw new Error('Invalid ride status for action');
      }

      if (newStatus === 'accepted') {
        await acceptRide({
          id: item.id,
          driverId: currentDriver.driverId,
        }).unwrap();
      } else {
        await updateRideStatus({ id: item.id, status: newStatus }).unwrap();
      }

      setButtonState('success');
    } catch (error) {
      setButtonState('error');
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('An unexpected error occurred');
      }
    } finally {
      setTimeout(() => {
        setButtonState('idle');
        setError(null);
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

  const isButtonDisabled = () => {
    return (
      buttonState !== 'idle' ||
      item.status === 'dropped-off' ||
      item.status === 'declined'
    );
  };

  return (
    <Card className="w-full max-w-md mx-auto overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xl font-bold">Ride Details</CardTitle>
        <Badge className={`${getStatusColor(item.status)} text-white`}>
          <Text>
            {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
          </Text>
        </Badge>
      </CardHeader>
      <CardContent>
        <View className="gap-4">
          <View className="flex-row items-center space-x-2 gap-2">
            <User className="h-5 w-5 text-gray-500" />
            <Text className="font-medium">{passenger?.name}</Text>
          </View>
          <View className="gap-2">
            <View className="flex-row items-center gap-2">
              <MapPin className="h-5 w-5 text-green-500" />
              <Text className="font-medium">Pickup:</Text>
            </View>
            <Text className="ml-7" numberOfLines={2}>
              {pickUpAddress?.formattedAddress}
            </Text>
          </View>
          <View className="gap-2">
            <View className="flex-row items-center gap-2">
              <MapPin className="h-5 w-5 text-red-500" />
              <Text className="font-medium">Drop-off:</Text>
            </View>
            <Text className="ml-7" numberOfLines={2}>
              {destinationAddress?.formattedAddress}
            </Text>
          </View>
        </View>
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onPress={() => setIsOpen(!isOpen)}>
              {isOpen ? (
                <View className="flex-row items-center space-x-2 gap-2">
                  <ChevronDown className="h-4 w-4 mr-2 text-gray-500" />
                  <Text>Show Less</Text>
                </View>
              ) : (
                <View className="flex-row items-center space-x-2 gap-2">
                  <ChevronUp className="h-4 w-4 mr-2 text-gray-500" />
                  <Text>Show More</Text>
                </View>
              )}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <View className="gap-4">
              <View className="flex-row items-center space-x-2 gap-2">
                <Phone className="h-4 w-4 text-gray-500" />
                <Text className="font-medium">Contact:</Text>
                <Text>{passenger?.phone}</Text>
              </View>
              <View className="flex-row items-center space-x-2 gap-2">
                <Users className="h-4 w-4 text-gray-500" />
                <Text className="font-medium">Passengers:</Text>
                <Text>{passenger?.numOfPassengers}</Text>
              </View>
              <View className="flex-row items-center space-x-2 gap-2">
                <Clock className="h-4 w-4 text-blue-500" />
                <Text className="font-medium">Pickup Time:</Text>
                <Text>
                  {format(new Date(item.pickupTime), 'MMM d, yyyy HH:mm')}
                </Text>
              </View>
              <View className="flex-row items-center space-x-2 gap-2">
                <Calendar className="h-4 w-4 text-purple-500" />
                <Text className="font-medium">Order Time:</Text>
                <Text>
                  {format(new Date(item.timestamp), 'MMM d, yyyy HH:mm')}
                </Text>
              </View>
              <View className="flex-row items-center space-x-2 gap-2">
                <Timer className="h-4 w-4 text-orange-500" />
                <Text className="font-medium">Expected Duration:</Text>
                <Text>35 mins</Text>
              </View>
            </View>
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
      <CardFooter>
        <Button
          onPress={handleRideAction}
          disabled={isButtonDisabled()}
          className="w-full">
          {buttonState === 'idle' && <Text>{getButtonText()}</Text>}
          {buttonState === 'loading' && (
            <View className="flex-row">
              <Loader2 className="mr-2 h-4 w-4 animate-spin text-green-500" />
            </View>
          )}
          {buttonState === 'success' && (
            <View className="flex-row">
              <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
              <Text>Success</Text>
            </View>
          )}
          {buttonState === 'error' && (
            <View className="flex-row">
              <XCircle className="mr-2 h-4 w-4 text-red-500" />
              <Text>{error}</Text>
            </View>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
