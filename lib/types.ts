export interface Ride {
  id: string;
  PassengerId: string;
  driverId: string | null;
  pickupLocation: { latitude: number; longitude: number };
  destination: { latitude: number; longitude: number };
  status:
    | 'pending'
    | 'accepted'
    | 'declined'
    | 'started'
    | 'picked-up'
    | 'dropped-off';
  pickupTime: string;
  timestamp: string;
}

export interface Passenger {
  id: string;
  PassengerId: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  numOfPassengers: number;
}
export interface Driver {
  id: string;
  driverId: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
}

export type User = Passenger | Driver;
