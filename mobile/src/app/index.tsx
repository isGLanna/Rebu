import { Button, TextButton, ThemedView } from '@comp/index'
import { ImageBackground, StyleSheet, View, Text, Appearance } from 'react-native'
import AsyncStorage from "@react-native-async-storage/async-storage"
import { LinearGradient } from 'expo-linear-gradient'
import { useThemeColor } from '@hooks/use-theme-color'
import { authenticate } from '@api/auth'
import { router } from 'expo-router'
import { useEffect } from 'react'

export default function App() {
  useEffect(() => {
    const verifyAuth = async () => {
      const role = await authenticate.isAuthtenticated()
      if (role === 'driver' || role === 'passenger') {
        router.push('/driver')
      } else if (role === 'passenger') {
        router.push('/rider')
      }
    }
    verifyAuth()

    const queryTheme = async () => {
      const storedTheme = await AsyncStorage.getItem('theme') as ('light' | 'dark' | null)
      const parsedTheme = JSON.parse(storedTheme || 'null')
      await Appearance.setColorScheme(parsedTheme)
    }

    queryTheme()
  }, [])
  const backgroundColor = useThemeColor({}, 'background')

  return (
    <ThemedView style={ styles.container }>
      <ImageBackground
        source={require('../assets/images/background_1.png')}
        style={[styles.backgroundImage, { backgroundColor }]}>
        <LinearGradient colors={[ 'transparent', backgroundColor ]} locations={[0, 0.8]} style={ styles.gradient } />
      </ImageBackground>
      <Text style={[ styles.title ]}>Rebu</Text>

      <View style={{ width: '100%', marginBottom: 32, alignItems: 'center', gap: 16 }}>
        <Button onPress={() => router.push('/login')} style={ styles.button }>
          Entrar
        </Button>
        <TextButton type='link' onPress={() => router.push('/register')}>
          Cadastrar
        </TextButton>
      </View>
    </ThemedView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: 16,
  },
  title: {
    position: 'absolute',
    top: '15%',
    paddingHorizontal: 2,
    paddingVertical: 2,
    color: '#fff',
    alignItems: 'center',
    justifyContent: 'center',

    fontSize: 64,
    fontFamily: 'Orbitron-SemiBold',
    textShadowColor: '#0a7da4c0',
    textShadowOffset: { width: -4, height: 4 },
    textShadowRadius: 8,
  },

  backgroundImage:{
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: '20%',
    overflow: 'hidden',
  },
  gradient: {
    flex: 1,
    left: 0,
    right: 0,
    top: '10%',
    bottom: 0,
  },
  button:{
    width: '100%',
    alignItems: 'center',
  },
})
