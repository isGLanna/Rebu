import { Button, ThemedView, ThemedText } from '@comp/index'
import { ImageBackground, StyleSheet, View, Text } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { useThemeColor } from '@hooks/use-theme-color'
import { authorize } from '@api/auth'
import { router } from 'expo-router'
import { Colors } from '../styles/theme'
import { useEffect } from 'react'

export default function App() {
  useEffect(() => {
    const verifyAuth = async () => {
      if (await authorize.isAuthtenticated())
        router.push('/explore')
    }
    verifyAuth()
  }, [])
  const backgroundColor = useThemeColor({}, 'background')

  return (
    <ThemedView style={ styles.container }>
      <ImageBackground
        source={require('../assets/images/background_1.png')}
        style={[styles.backgroundImage, { backgroundColor }]}>
        <LinearGradient colors={[ 'transparent', Colors.branding._800 ]} locations={[0, 0.8]} style={ styles.gradient } />
      </ImageBackground>
      <Text style={[ styles.title ]}>Rebu</Text>

      <View style={{ width: '100%', marginBottom: 32, alignItems: 'center', gap: 16 }}>
        <Button onPress={() => router.push('/login')} style={ styles.button }>
          Entrar
        </Button>
        <ThemedText type='link' onPress={() => router.push('/register')}>
          Cadastrar
        </ThemedText>
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
