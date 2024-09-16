import { http, HttpResponse } from 'msw';
import { faker } from '@faker-js/faker';
import { LatLng, Region } from 'react-native-maps';

export const initialRegion: Region = {
  latitude: 37.78815,
  longitude: -122.4324,
  latitudeDelta: 0.0922,
  longitudeDelta: 0.0421,
};

export interface Ride {
  id: string;
  userId: string;
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

const genFakeLocation = (initialRegion: Region) => {
  const [latitude, longitude] = faker.location.nearbyGPSCoordinate({
    origin: [initialRegion.latitude, initialRegion.longitude],
    radius: 1,
  });
  return { latitude, longitude } as LatLng;
};

export const generateFakeRide = (): Ride => ({
  id: faker.string.uuid(),
  userId: faker.string.uuid(),
  driverId: faker.datatype.boolean() ? faker.string.uuid() : null,
  pickupLocation: genFakeLocation(initialRegion),
  destination: genFakeLocation(initialRegion),
  status: faker.helpers.arrayElement([
    'pending',
    'accepted',
    'declined',
    'started',
    'picked-up',
    'dropped-off',
  ]) as Ride['status'],
  pickupTime: faker.date.future().toISOString(),
  timestamp: faker.date.recent().toISOString(),
});

export let rides: Ride[] = Array.from({ length: 10 }, generateFakeRide);

export const handlers = [
  http.get('http://example.com/api/rides', () => {
    console.log('rides in mock', rides);
    return HttpResponse.json(rides);
  }),

  http.get('/api/rides/:id', ({ params }) => {
    const { id } = params;
    const ride = rides.find((r) => r.id === id);
    return ride
      ? HttpResponse.json(ride)
      : new HttpResponse(null, { status: 404 });
  }),

  http.post('/api/rides/:id/accept', async ({ params, request }) => {
    const { id } = params;
    const { driverId } = (await request.json()) as { driverId: string };
    const ride = rides.find((r) => r.id === id);
    if (ride && ride.status === 'pending') {
      ride.driverId = driverId;
      ride.status = 'accepted';
      return HttpResponse.json(ride);
    }
    return new HttpResponse(null, { status: 400 });
  }),

  http.patch('/api/rides/:id/status', async ({ params, request }) => {
    const { id } = params;
    const { status } = (await request.json()) as { status: Ride['status'] };
    const ride = rides.find((r) => r.id === id);
    if (ride) {
      ride.status = status;
      return HttpResponse.json(ride);
    }
    return new HttpResponse(null, { status: 404 });
  }),

  http.post('/api/rides', () => {
    const newRide = generateFakeRide();
    newRide.status = 'pending';
    rides.push(newRide);
    return HttpResponse.json(newRide, { status: 201 });
  }),
];
