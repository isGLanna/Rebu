import { StyleSheet, View } from 'react-native'

import { ThemedText } from '@/src/components/atoms/themed-text'
import { ThemedView } from '@/src/components/atoms/themed-view'
import { useThemeColor } from '@hooks/use-theme-color'
import { Colors } from '@/src/styles/theme'

interface ModalScreenProps {
  title: string
  children?: React.ReactNode
}

export function ModalScreen({title, children}: ModalScreenProps) {
  const shadowColor = Colors.branding._500 + '80'
  const borderColor = useThemeColor({}, 'border')

  return (
    <ThemedView style={[styles.container, { boxShadow: `2px 2px 12px ${shadowColor}`, borderColor }]}>
      <ThemedText type="subtitle">{title}</ThemedText>
      <ThemedView>
        {children}
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    alignSelf: 'center',
    top: '30%',
    borderWidth: 1,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 16,
    marginHorizontal: 16,
  },
});
