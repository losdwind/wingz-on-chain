import { registerRootComponent } from 'expo';
import { ExpoRoot } from 'expo-router';
import { server } from './mock/server';
import './mock/msw.polyfills';

server.listen({ onUnhandledRequest: 'bypass' });
server.events.on('request:start', ({ request }) => {
  console.log('Outgoing:', request.method, request.url);
});

export function App() {
  const ctx = require.context('./app');
  return <ExpoRoot context={ctx} />;
}

registerRootComponent(App);
