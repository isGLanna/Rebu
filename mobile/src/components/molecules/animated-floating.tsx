import { Animated, View, StyleSheet } from 'react-native'
import { useRef, useState } from 'react'
import { Input, ThemedText } from '../atoms'
import { useThemeColor } from '@/src/hooks/use-theme-color'

export type FloatingLabelProps = React.ComponentProps<typeof Input> & {
  label: string
  focused: boolean
}

const AnimatedThemedText = Animated.createAnimatedComponent(ThemedText)

export function FloatingLabel({ label, focused, ...inputProps }: FloatingLabelProps) {
  const animated = useRef(new Animated.Value(0)).current
  const formColor = useThemeColor({}, 'container')
  const [isFocused, setIsFocused] = useState(false)

  const handleFocus = () => {
    setIsFocused(true)
    Animated.timing(animated, {
      toValue: 1,
      duration: 150,
      useNativeDriver: true,
    }).start()
  }

  const handleBlur = () => {
    if(!inputProps.value?.trim()) {
      setIsFocused(false)
      Animated.timing(animated, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }).start()
    }
  }

  const translateY = animated.interpolate({
    inputRange: [0, 1],
    outputRange: [12, -16],
  })

  const translateX = animated.interpolate({
    inputRange: [0, 1],
    outputRange: [12, 8],
  })

  return (
    <View style={{ width: '100%'}}>
      <AnimatedThemedText style={[ styles.label, { backgroundColor: formColor }, { transform: [{ translateY }, { translateX }] } ]}>
        {label}
      </AnimatedThemedText>
      <Input onFocus={handleFocus} onBlur={handleBlur} {...inputProps}/>
    </View>
  )
}

const styles = StyleSheet.create({

  label: {
    position: 'absolute',
    paddingHorizontal: 4,
    justifyContent: 'center',
    zIndex: 2,
  },
})