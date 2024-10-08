import { Link, Stack } from 'expo-router';
import { View } from 'react-native';
import { Text } from '~/components/ui/text';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Oops!' }} />
      <View className="flex items-center justify-center h-full">
        <Text className="text-xl font-bold">You've reached a dead end.</Text>
        <Link href="/">
          <Text className="text-lg font-medium">Go back home</Text>
        </Link>
      </View>
    </>
  );
}
