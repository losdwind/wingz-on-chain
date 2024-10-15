// src/server.js
import { createServer, Model, Factory, Response } from 'miragejs';
import { faker } from '@faker-js/faker';
import { Region } from 'react-native-maps';

interface Passenger {
  id: string;
  passengerId: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  numOfPassengers: number;
  token: string;
}

interface Driver {
  id: string;
  driverId: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  token: string;
}
interface Ride {
  id: string;
  passengerId: string;
  driverId: string | null;
  pickupLocation: { latitude: number; longitude: number };
  destination: { latitude: number; longitude: number };
  status: string;
  pickupTime: string;
  timestamp: string;
}

let region: Region;
const genFakeLocation = (region: Region) => {
  const radius = Math.min(region.latitudeDelta, region.longitudeDelta) / 2;
  const radiusInKm = radius * 1000;

  const [latitude, longitude] = faker.location.nearbyGPSCoordinate({
    origin: [region.latitude, region.longitude],
    radius: radiusInKm,
    isMetric: true,
  });
  return { latitude, longitude };
};
let rides: Ride[] = [];
export function makeServer({ environment = 'development' } = {}) {
  let server = createServer({
    environment,
    logging: true,
    models: {
      user: Model.extend<Partial<Passenger>>({}),
      driver: Model.extend<Partial<Driver>>({}),
      ride: Model.extend<Partial<Ride>>({}),
    },

    factories: {
      passenger: Factory.extend<Partial<Passenger>>({
        id: () => faker.string.uuid(),
        passengerId: () => faker.string.uuid(),
        name: () => faker.person.fullName(),
        email: () => faker.internet.email(),
        phone: () => faker.phone.number(),
        avatar: () => faker.image.avatar(),
        numOfPassengers: () => faker.number.int({ min: 1, max: 5 }),
      }),
      driver: Factory.extend<Partial<Driver>>({
        id: () => faker.string.uuid(),
        driverId: () => faker.string.uuid(),
        name: () => faker.person.fullName(),
        email: () => faker.internet.email(),
        phone: () => faker.phone.number(),
        avatar: () => faker.image.avatar(),
      }),
    },

    seeds(server) {
      server.createList('passenger', 5);
      server.createList('driver', 2);
    },

    routes() {
      this.pretender.handledRequest = (verb, path, request) => {
        console.log(`[${verb.toUpperCase()}] ${path}`);
        console.log('Request headers:', request.requestHeaders);
        console.log('Request body:', request.requestBody);
        console.log('Response:', request.responseText);
        console.log('---');
      };

      this.urlPrefix = 'http://example.com';
      this.namespace = 'api';

      this.get('/passengers', (schema, request) => {
        return schema.all('passenger');
      });

      this.get('/drivers', (schema, request) => {
        return schema.all('driver');
      });

      this.get('/passengers/:id', (schema, request) => {
        const { id } = request.params;
        try {
          const passenger = schema.db.passengers.findBy({ passengerId: id });

          if (passenger) {
            return passenger;
          } else {
            return new Response(404, {}, { error: 'Passenger not found' });
          }
        } catch (error) {
          console.error('Error in passenger lookup:', error);
          return new Response(500, {}, { error: 'Internal server error' });
        }
      });

      this.get('/drivers/:id', (schema, request) => {
        const { id } = request.params;
        const driver = schema.find('driver', id);
        return driver || new Response(404);
      });

      this.post('/login', (schema, request) => {
        const { passengerId, driverId } = JSON.parse(request.requestBody);

        const driver = schema.db.drivers.findBy({ driverId: driverId });
        const passenger = schema.db.passengers.findBy({
          passengerId: passengerId,
        });

        if (driver) {
          return {
            driver: driver,
            token: faker.string.uuid(),
          };
        }
        if (passenger) {
          return {
            passenger: passenger,
            token: faker.string.uuid(),
          };
        }
        return new Response(401);
      });

      this.post('/logout', (schema, request) => {
        return new Response(200);
      });

      this.get('/rides', (schema, request) => {
        const { latitude, longitude, latitudeDelta, longitudeDelta } =
          request.queryParams;
        if (!latitude || !longitude || !latitudeDelta || !longitudeDelta) {
          return new Response(
            400,
            {},
            {
              error:
                'Missing required parameters: latitude, longitude, latitudeDelta, longitudeDelta',
            }
          );
        }

        region = {
          latitude: parseFloat(latitude as string),
          longitude: parseFloat(longitude as string),
          latitudeDelta: parseFloat(latitudeDelta as string),
          longitudeDelta: parseFloat(longitudeDelta as string),
        };
        const filterFn = (ride: Ride) => {
          return ride.status === 'pending';
        };
        if (rides.filter(filterFn).length === 0) {
          rides = Array.from({ length: 10 }, () => ({
            id: faker.string.uuid(),
            passengerId: (() => {
              const passengers: Passenger[] = server.db.passengers;
              return passengers[Math.floor(Math.random() * passengers.length)]
                .passengerId;
            })(),
            driverId: null,
            pickupLocation: genFakeLocation(region),
            destination: genFakeLocation(region),
            status: faker.helpers.arrayElement(['pending']),
            pickupTime: faker.date.future().toISOString(),
            timestamp: faker.date.recent().toISOString(),
          }));
        }
        return {
          rides: rides,
        };
      });

      this.get('/rides/orderHistory', (schema, request) => {
        const bearerToken =
          request.requestHeaders.authorization ||
          request.requestHeaders.Authorization;
        const token = bearerToken?.split(' ')[1];
        const driver = schema.findBy('driver', { token: token });
        if (!driver) {
          return new Response(401);
        }
        return schema.where('ride', { driverId: driver.id });
      });

      this.get('/rides/:id', (schema, request) => {
        const { id } = request.params;
        const ride = rides.find((ride) => ride.id === id);
        return ride || new Response(404);
      });

      this.post('/rides/:id/accept', (schema, request) => {
        const bearerToken =
          request.requestHeaders.authorization ||
          request.requestHeaders.Authorization;
        if (!bearerToken) {
          return new Response(401, {}, { error: 'No token provided' });
        }
        const { id } = request.params;
        const { driverId } = JSON.parse(request.requestBody);
        const rideIndex = rides.findIndex((ride) => ride.id === id);
        const ride = rides[rideIndex];

        if (ride && ride.status === 'pending') {
          ride.driverId = driverId;
          ride.status = 'accepted';
          rides[rideIndex] = ride;
          return ride;
        }
        return new Response(400);
      });
      this.post('/rides/:id/decline', (schema, request) => {
        const bearerToken =
          request.requestHeaders.authorization ||
          request.requestHeaders.Authorization;
        if (!bearerToken) {
          return new Response(401, {}, { error: 'No token provided' });
        }
        const { id } = request.params;
        const { driverId } = JSON.parse(request.requestBody);
        const rideIndex = rides.findIndex((ride) => ride.id === id);
        const ride = rides[rideIndex];
        if (ride && ride.status === 'pending') {
          ride.status = 'declined';
          ride.driverId = driverId;
          rides[rideIndex] = ride;
          return ride;
        }
        return new Response(400);
      });

      this.patch('/rides/:id/status', (schema, request) => {
        const bearerToken =
          request.requestHeaders.authorization ||
          request.requestHeaders.Authorization;
        if (!bearerToken) {
          return new Response(401, {}, { error: 'No token provided' });
        }
        const { id } = request.params;
        const { status } = JSON.parse(request.requestBody);
        const ride = rides.find((ride) => ride.id === id);
        if (ride) {
          ride.status = status;
          return ride;
        }
        return new Response(404);
      });

      this.post('/rides', (schema, request) => {
        const bearerToken =
          request.requestHeaders.authorization ||
          request.requestHeaders.Authorization;
        if (!bearerToken) {
          return new Response(401, {}, { error: 'No token provided' });
        }
        const attrs = JSON.parse(request.requestBody);
        attrs.status = 'pending';
        let ride = { ...attrs, id: faker.string.uuid() };
        rides.push(ride);
        return ride;
      });

      this.passthrough('https://routes.googleapis.com/**');
    },
  });

  return server;
}
