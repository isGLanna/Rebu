import { ThemedText, ThemedView } from '@comp/index';

export default function Profile() {
  return (
    <ThemedView style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <ThemedText>Teste 1</ThemedText>
      <ThemedText>Teste 2</ThemedText>
      <ThemedText>Teste 3</ThemedText>
    </ThemedView>
  )
}