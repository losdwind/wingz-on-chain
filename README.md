# Wingz-on-chain

A React Native project template designed to help you kickstart your mobile app development quickly and efficiently. This starter base incorporates common components from `react-native-reusables`, sets up a solid foundation for your project, and includes powerful state management and API integration tools.

## Features

- **State Management and API Integration**:
  - Redux Toolkit for global state management
  - RTK Query for efficient API calls and caching
- **Map Integration**:
  - React-native-maps
  - React-native-maps-routes
- **Mocking API**: MirageJS
- **Blockchain**: TON or Solana or Ethereum
- **Component Library**:
  - NativeWind v4: Utility-first CSS framework for React Native
  - react-native-reusables: React Native version of shadcn/ui

## Preview

https://github.com/user-attachments/assets/ee4b2400-df0d-4c8e-87c6-d7f2ef63333d

## Getting Started

1. Clone this repository
2. Install dependencies:
   ```
   yarn install
   ```
3. configure .env with your API keys: rename .env.example to .env and fill in the values. Please restrict access to your map api keys on Google Cloud Platform because the api key is public by design.
4. Run the project:

   - For Android:
     ```
     yarn dev:android
     ```
     - For iOS (not working):
     ```
     yarn dev:ios
     ```

## Project Structure

The project follows a standard React Native structure with some additional configurations:

- `src/`: Main source code directory
  - `app`: features and screens
  - `components/`: Reusable UI components
  - `store/`: Redux store configuration
    - `api/`: RTK Query API definitions
  - `hooks/`: Custom React hooks
  - `lib/`: Utility functions and helpers
  - `types/`: Type definitions
  - `assets/`: Images and icons
  - `mock/`: Mock data and API
- `index.js`: Entry point for the app
- `app.json`: Expo configuration file

## State Management and API Integration

This project uses Redux for state management, with Redux Toolkit to simplify the Redux setup and RTK Query for efficient API integration:

- **Redux**: Manages the global state of the application
- **Redux Toolkit**: Provides utilities to simplify common Redux use cases
- **RTK Query**: Manages API calls, caching, and synchronization with the Redux store

To use these features:

1. Define your API endpoints in `src/store/api/`
2. Create Redux slices for local state management in `src/store/slices/`
3. Use the `useSelector` and `useDispatch` hooks from React-Redux to access and update state
4. Utilize RTK Query hooks for API calls in your components

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is open source and available under the [MIT License](LICENSE).
