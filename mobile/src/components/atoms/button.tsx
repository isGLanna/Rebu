import { TouchableOpacity, StyleSheet, StyleProp, ViewStyle } from 'react-native'
import { ThemedText } from './themed-text';
import { Colors } from '@/src/styles/theme';
import { useTheme } from '@/src/context/theme';

interface ButtonProps {
  title: string
  onPress: () => void
  style?: StyleProp<ViewStyle>
}

export function Button({ title, onPress, style }: ButtonProps) {
  const buttonColor = useTheme().theme === 'light' ? Colors.branding._700 : Colors.branding._300
  return (
    <TouchableOpacity onPress={onPress} style={[{ backgroundColor: buttonColor }, buttonStyles.button, style]} activeOpacity={0.7}>
      <ThemedText>{title}</ThemedText>
    </TouchableOpacity>
  )
}

const buttonStyles = StyleSheet.create({
  button: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
  }
})