import { View, StyleSheet } from 'react-native';
import { Text } from '~/components/ui/text';
import { Button } from '~/components/ui/button';
export function ErrorMessage({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <View style={styles.errorContainer}>
      <Text style={styles.errorText}>{message}</Text>
      <Button onPress={onRetry}>
        <Text>Retry</Text>
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  errorContainer: {
    position: 'absolute',
    top: 100,
    left: 60,
    right: 60,
    backgroundColor: 'rgba(93, 72, 72, 0.7)',
    padding: 10,
    borderRadius: 5,
  },
  errorText: {
    color: 'white',
    textAlign: 'center',
  },
});
