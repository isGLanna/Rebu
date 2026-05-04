import { useThemeColor } from '@hooks/use-theme-color'
import { TextInput, TextInputProps, StyleSheet, TextStyle, StyleProp } from 'react-native'

interface InputProps extends TextInputProps {
  styles?: StyleProp<TextStyle>
}

export function Input ({ style,...props}: InputProps) {
  const borderColor = useThemeColor({}, 'border')
  const textColor = useThemeColor({}, 'text')

  return (
    <TextInput {...props} style={[ styles.input, { borderColor, color: textColor }, style]} ></TextInput>
  )
}

const styles = StyleSheet.create({
  input: {
    width: '100%',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderRadius: 8,
    userSelect: 'none',
  }
})