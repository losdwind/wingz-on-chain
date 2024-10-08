import { registerRootComponent } from 'expo';
import { ExpoRoot } from 'expo-router';

import { makeServer } from './mock/mirage';

if (process.env.NODE_ENV === 'development') {
  if (window.server) {
    window.server.shutdown();
  }
  window.server = makeServer();
  window.server.logging = true;
}

// // server.listen({ onUnhandledRequest: 'bypass' });
// async function enableMocking() {
//   if (!__DEV__) {
//     return;
//   }

//   await import('./mock/msw.polyfills');
//   const { server } = await import('./mock/server');
//   server.listen({ onUnhandledRequest: 'bypass' });
//   server.events.on('request:start', ({ request }) => {
//     console.log(
//       'Outgoing:',
//       request.method,
//       request.url,
//       request.headers,
//       request.body
//     );
//   });
// }
// (async () => {
//   await enableMocking();
//   // rest of your code here
// })();

export function App() {
  const ctx = require.context('./app');
  return <ExpoRoot context={ctx} />;
}

registerRootComponent(App);
