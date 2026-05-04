import { StyleSheet, type TextProps, View, Animated } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { useEffect, useRef, useState } from 'react'
import { Colors } from '@/src/styles/theme'

export type ThemedTextProps = TextProps & {
  type?: 'normal' | 'title' | 'subtitle' | 'regular' | 'defaultSemiBold' | 'link';
}

export function TextSkeleton({ type = 'normal' }: ThemedTextProps) {
  const animatedValue = useRef(new Animated.Value(0)).current
  const gradientColors = [Colors.grey._700, Colors.grey._500]
  const [ viewWidth, setViewWidth ] = useState(0)

  useEffect(() => {
    animatedValue.setValue(0)
    const animated = Animated.loop(
      Animated.timing(animatedValue, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true
      })
    )

    animated.start()
    return () => animated.stop()
  }, [animatedValue])

  const translateX = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [-viewWidth, viewWidth]
  })

  return (
    <View
      onLayout={(e) => setViewWidth(e.nativeEvent.layout.width)}
      style={[
        { backgroundColor: gradientColors[0], overflow: 'hidden', borderRadius: 4 },
        type === 'title' ? styles.title : undefined,
        type === 'subtitle' ? styles.subtitle : undefined,
        type === 'normal' ? styles.normal : undefined,
        type === 'regular' ? styles.regular : undefined,
        type === 'defaultSemiBold' ? styles.defaultSemiBold : undefined,
        type === 'link' ? styles.link : undefined,
      ]}>
      {viewWidth > 0 && (
      <Animated.View style={[StyleSheet.absoluteFill, {transform: [{ translateX }]}]}>
        <LinearGradient
          colors={['transparent', gradientColors[1], 'transparent']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={StyleSheet.absoluteFill}
          />
      </Animated.View>)}
    </View>
  )
}

const styles = StyleSheet.create({
  normal: {
    height: 16,
    marginBottom: 4,
  },
  defaultSemiBold: {
    height: 16,
    marginBottom: 4,
    fontWeight: '600',
  },
  title: {
    height: 24,
    fontWeight: '600',
    marginBottom: 8,
  },
  subtitle: {
    height: 20,
    fontWeight: '500',
    marginBottom: 6,
  },
  link: {
    marginBottom: 4,
    height: 18,
    textDecorationLine: 'underline',
  },
  regular: {
    height: 14,
    marginBottom: 4,
    fontWeight: '400',
  },
});
