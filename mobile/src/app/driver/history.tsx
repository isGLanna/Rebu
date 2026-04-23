import { ThemedText, ThemedView } from '@comp/index';

export default function History() {
  return (
    <ThemedView style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <ThemedText>Meu histórico de corridas</ThemedText>
      <ThemedText>Teste 2</ThemedText>
      <ThemedText>Teste 3</ThemedText>
    </ThemedView>
  )
}