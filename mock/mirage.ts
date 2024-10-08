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

type User = Passenger | Driver;

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
      ride: Factory.extend<Partial<Ride>>({
        id: () => faker.string.uuid(),
        passengerId: () => {
          const passengers: Passenger[] = server.db.passengers;
          return passengers[Math.floor(Math.random() * passengers.length)]
            .passengerId;
        },
        driverId: () => null,
        pickupLocation: () => genFakeLocation(region),
        destination: () => genFakeLocation(region),
        status: () =>
          faker.helpers.arrayElement([
            'pending',
            'accepted',
            'declined',
            'started',
            'picked-up',
            'dropped-off',
          ]),
        pickupTime: () => faker.date.future().toISOString(),
        timestamp: () => faker.date.recent().toISOString(),
      }),
    },

    seeds(server) {
      server.createList('passenger', 5);
      server.createList('driver', 2);
    },

    routes() {
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
        const passenger = schema.find('passenger', id);
        return passenger || new Response(404);
      });

      this.get('/drivers/:id', (schema, request) => {
        const { id } = request.params;
        const driver = schema.find('driver', id);
        return driver || new Response(404);
      });

      this.post('/login', (schema, request) => {
        const { passengerId, driverId } = JSON.parse(request.requestBody);
        console.log('driverId', driverId);

        const driver = schema.findBy('driver', { driverId: driverId })?.attrs;
        const passenger = schema.findBy('passenger', {
          passengerId: passengerId,
        })?.attrs;

        console.log('drivers', schema.all('driver'));

        if (driver) {
          console.log('driver', driver);
          return {
            driver: driver,
            token: faker.string.uuid(),
          };
        }
        if (passenger) {
          console.log('passenger', passenger);
          return {
            Passenger: passenger,
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

        const bearToken = request.requestHeaders.Authorization;
        const token = bearToken?.split(' ')[1];
        const driver = schema.findBy('driver', { token: token });

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

        if (schema.all('ride').length === 0) {
          server.createList('ride', 50);
        }
        return schema.where('ride', { status: 'pending' });
      });

      this.get('/rides/orderHistory', (schema, request) => {
        const bearToken = request.requestHeaders.Authorization;
        const token = bearToken?.split(' ')[1];
        const driver = schema.findBy('driver', { token: token });
        if (!driver) {
          return new Response(401);
        }
        return schema.where('ride', { driverId: driver.id });
      });

      this.get('/rides/:id', (schema, request) => {
        const { id } = request.params;
        const ride = schema.find('ride', id);
        return ride || new Response(404);
      });

      this.post('/rides/:id/accept', (schema, request) => {
        const { id } = request.params;
        const { driverId } = JSON.parse(request.requestBody);
        const ride = schema.find('ride', id);

        if (ride && ride.status === 'pending') {
          return ride.update({ driverId, status: 'accepted' });
        }
        return new Response(400);
      });

      this.patch('/rides/:id/status', (schema, request) => {
        const { id } = request.params;
        const { status } = JSON.parse(request.requestBody);
        const ride = schema.find('ride', id);
        if (ride) {
          return ride.update({ status });
        }
        return new Response(404);
      });

      this.post('/rides', (schema, request) => {
        const attrs = JSON.parse(request.requestBody);
        attrs.status = 'pending';
        return schema.create('ride', attrs);
      });

      this.passthrough('https://routes.googleapis.com/**');
    },
  });

  return server;
}
