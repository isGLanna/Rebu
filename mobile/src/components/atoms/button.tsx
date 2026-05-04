import { TouchableOpacity, StyleSheet, StyleProp, ViewStyle } from 'react-native'
import { ThemedText } from './themed-text'
import { Colors } from '@/src/styles/theme'
import { useColorScheme } from '@hooks/use-color-scheme'
import { useThemeColor } from '@/src/hooks/use-theme-color'

interface ButtonProps {
  onPress: () => void
  style?: StyleProp<ViewStyle>
  theme?: 'light' | 'dark'
  type?: 'title' | 'subtitle' | 'normal' | 'regular' | 'defaultSemiBold' | 'link'
  children?: React.ReactNode
}

export function Button({ onPress, style, type = 'defaultSemiBold', children }: ButtonProps) {
  const buttonColor = useThemeColor({}, 'button')
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[buttonStyles.button, { backgroundColor: buttonColor }, style]}
      activeOpacity={0.7}
    >
      <ThemedText type={type} style={{ color: Colors.dark.text }}>
        {children}
      </ThemedText>
    </TouchableOpacity>
  )
}


export function TextButton({ onPress, style, theme = useColorScheme() as 'light' | 'dark', type = 'defaultSemiBold', children }: ButtonProps) {
  return (
    <TouchableOpacity onPress={onPress} style={style} activeOpacity={0.7}>
      <ThemedText themeColor={theme} type={type} style={{ color: Colors[theme].text }}>
        {children}
      </ThemedText>
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