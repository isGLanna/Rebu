import { Animated, View, StyleSheet, type ViewProps } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { useEffect, useRef, useState } from 'react'
import { Colors } from '@comp/../styles/theme'

type ImageSkeletonProps = ViewProps & {
  styles?: string
}

export function ImageSkeleton({ styles, ...props }: ImageSkeletonProps) {
  const gradientColors = [Colors.grey._500, Colors.grey._300]
  const animatedValue = useRef(new Animated.Value(0)).current
  const [ viewWidth, setViewWidth ] = useState(0)

  useEffect(() => {
    animatedValue.setValue(0)

    const animated = Animated.loop(
      Animated.timing(animatedValue, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: true,
      })
    )

    animated.start()
    return () => animated.stop()
  }, [])

  const translateX = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [-viewWidth, viewWidth]
  })

  return (
    <View
      onLayout={(e) => setViewWidth(e.nativeEvent.layout.width)}
      style={[{ flex: 1, backgroundColor: gradientColors[0], overflow: 'hidden', borderRadius: 8}, props.style]}
      >
      {viewWidth > 0 && (
        <Animated.View style={[StyleSheet.absoluteFill, {transform: [{ translateX }]}]}>
          <LinearGradient
            colors={['transparent', gradientColors[1], 'transparent']}
            style={StyleSheet.absoluteFill}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            />
        </Animated.View>)}
    </View>
  )
}