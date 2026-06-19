import { StyleSheet, Animated } from 'react-native'
import { ThemedText, ThemedView } from '@comp/index'
import { Colors } from '@styles/theme'
import { Appearance } from 'react-native'
import { useEffect, useRef } from 'react'

interface ToastProps {
  message: string | undefined,
  type: 'success' | 'info' | 'error' | 'warning' | undefined,
  active: boolean | undefined,
  onClose: () => void
}

export function Toast({ message, type = 'info', active, onClose }: ToastProps) {
  const Animation = useRef(new Animated.Value(0)).current
  const theme = Appearance.getColorScheme()
  const backgroundColor = theme === 'light' ? Colors.gray._200 : Colors.gray._800

  useEffect(() => {
    if(active) {
      Animated.timing(Animation, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start()
    } else {
      Animated.sequence([
        Animated.timing(Animation, {
          toValue: 2,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(Animation, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        })
      ]).start(onClose)
    }
  }, [active])

  const translateY = Animation.interpolate({
    inputRange: [0, 1, 2],
    outputRange: [0, 0, -100]
  })

  const translateX = Animation.interpolate({
    inputRange: [0, 1, 2],
    outputRange: [400, 0, 0]
  })

  return (
    <Animated.View style={[styles.container, { transform: [ { translateY: translateY }, { translateX: translateX } ] }]}>
      <ThemedView style={{ backgroundColor }}>
        <ThemedText style={[styles.content, { borderColor: stateColor(type) } ]}>{message}</ThemedText>
      </ThemedView>
    </Animated.View>
  )
}


function stateColor(type: 'success' | 'info' | 'error' | 'warning' = 'info') {
  switch(type) {
    case 'success': return Colors.green._400
    case 'error': return Colors.red._400
    case 'warning': return Colors.yellow._500
    default: return Colors.blue._500
  }
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 32,
    width: '80%',
    marginHorizontal: '10%',
    minHeight: 40,
    borderRadius: 8,
    overflow: 'hidden',
  },
  content: {
    height: '100%',
    paddingHorizontal: 12,
    borderLeftWidth: 4,
    borderBottomWidth: 1,
    borderRadius: 8,
    textAlignVertical: 'center',
  }
})