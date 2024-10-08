import { bypass, http, HttpResponse, passthrough } from 'msw';
import { faker } from '@faker-js/faker';
import { LatLng, Region } from 'react-native-maps';
import { Driver, Ride, Passenger } from '~/lib/types';

export const generateFakeUser = (): Passenger => ({
  id: faker.string.uuid(),
  PassengerId: faker.string.uuid(),
});

export const generateFakeDriver = (): Driver => ({
  id: faker.string.uuid(),
  driverId: faker.string.uuid(),
});

const genFakeLocation = (region: Region) => {
  const radius = Math.min(region.latitudeDelta, region.longitudeDelta) / 2;
  const radiusInKm = radius * 1000;

  const [latitude, longitude] = faker.location.nearbyGPSCoordinate({
    origin: [region.latitude, region.longitude],
    radius: radiusInKm,
    isMetric: true,
  });
  return { latitude, longitude } as LatLng;
};

export let users: Passenger[] = Array.from({ length: 5 }, generateFakeUser);
export let drivers: Driver[] = Array.from({ length: 2 }, generateFakeDriver);

export const generateFakeRide = (region: Region): Ride => {
  const userIndex = faker.number.int({ min: 0, max: users.length - 1 });
  const user = users[userIndex];

  const status = faker.helpers.arrayElement([
    'pending',
    'accepted',
    'declined',
    'started',
    'picked-up',
    'dropped-off',
  ]) as Ride['status'];

  const driverIndex = faker.number.int({ min: 0, max: drivers.length - 1 });
  const driver = drivers[driverIndex];

  return {
    id: faker.string.uuid(),
    PassengerId: user.PassengerId,
    driverId: status === 'pending' ? null : driver.driverId,
    pickupLocation: genFakeLocation(region),
    destination: genFakeLocation(region),
    status: status,
    pickupTime: faker.date.future().toISOString(),
    timestamp: faker.date.recent().toISOString(),
  };
};

export let rides: Ride[];

export const handlers = [
  http.get('http://example.com/api/rides', (request) => {
    const url = new URL(request.request.url);
    const latitude = url.searchParams.get('latitude');
    const longitude = url.searchParams.get('longitude');
    const latitudeDelta = url.searchParams.get('latitudeDelta');
    const longitudeDelta = url.searchParams.get('longitudeDelta');

    if (!latitude || !longitude || !latitudeDelta || !longitudeDelta) {
      return HttpResponse.json(
        {
          error:
            'Missing required parameters: latitude, longitude, latitudeDelta, longitudeDelta',
        },
        { status: 400 }
      );
    }

    if (!rides) {
      rides = Array.from({ length: 50 }, () =>
        generateFakeRide({
          latitude: parseFloat(latitude),
          longitude: parseFloat(longitude),
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        } as Region)
      );
    }

    return HttpResponse.json(rides.filter((ride) => ride.status === 'pending'));
  }),

  http.get('http://example.com/api/rides/:id', ({ params }) => {
    const { id } = params;
    const ride = rides.find((r) => r.id === id);
    return ride
      ? HttpResponse.json(ride)
      : new HttpResponse(null, { status: 404 });
  }),

  http.post(
    'http://example.com/api/rides/:id/accept',
    async ({ params, request }) => {
      const { id } = params;
      const { driverId } = (await request.json()) as { driverId: string };
      const ride = rides.find((r) => r.id === id);
      if (ride && ride.status === 'pending') {
        ride.driverId = driverId;
        ride.status = 'accepted';
        return HttpResponse.json(ride);
      }
      return new HttpResponse(null, { status: 400 });
    }
  ),

  http.patch(
    'http://example.com/api/rides/:id/status',
    async ({ params, request }) => {
      const { id } = params;
      const { status } = (await request.json()) as { status: Ride['status'] };
      const ride = rides.find((r) => r.id === id);
      if (ride) {
        ride.status = status;
        return HttpResponse.json(ride);
      }
      return new HttpResponse(null, { status: 404 });
    }
  ),

  http.post('http://example.com/api/rides', async ({ params, request }) => {
    const body = await request.json();
    // Extract the region from the request body
    const { region } = body;

    const newRide = generateFakeRide(region);
    newRide.status = 'pending';
    rides.push(newRide);
    return HttpResponse.json(newRide, { status: 201 });
  }),

  // http.post(
  //   'https://routes.googleapis.com/directions/v2:computeRoutes',
  //   async ({ params, request }) => {
  //     console.log('+++++++', params, request);
  //     // Forward the request to the real Google API
  //     const response = await fetch(bypass(new Request(request.url, request)));
  //     console.log('------', response);
  //     const routes = await response.json();

  //     return HttpResponse.json({
  //       routes,
  //     });
  //   }
  // ),
];
