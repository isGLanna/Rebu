import { Link } from 'expo-router';
import { StyleSheet } from 'react-native';

import { ThemedText } from '@/src/components/atoms/themed-text';
import { ThemedView } from '@/src/components/atoms/themed-view';

export function ModalScreen() {
  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">This is a modal</ThemedText>
      <Link href="/" dismissTo style={styles.link}>
        <ThemedText type="link">Go to home screen</ThemedText>
      </Link>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    backgroundColor: 'rgb(21, 38, 48)',
    borderColor: '#3185b6',
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  link: {
    marginTop: 15,
    paddingVertical: 15,
  },
});
