import { Button, ThemedView, ThemedText } from '@comp/index'
import { ImageBackground, StyleSheet, View } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { useThemeColor } from '@hooks/use-theme-color'
import { router } from 'expo-router'
import { Colors } from '../styles/theme'

export default function App() {
  const backgroundColor = useThemeColor({}, 'background')
  return (
    <ThemedView style={ styles.container }>
      <ImageBackground source={require('../assets/images/background.png')} style={[styles.backgroundImage, { backgroundColor }]}>
        <LinearGradient colors={[ 'transparent', Colors.branding._800 ]} locations={[0, 0.8]} style={ styles.gradient } />
      </ImageBackground>

      <View style={{ width: '100%', marginBottom: 32, alignItems: 'center', gap: 16 }}>
        <Button onPress={() => router.push('/explore')} style={ styles.button }>Entrar</Button>
        <ThemedText type='link'>Cadastrar</ThemedText>
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
  backgroundImage:{
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: '10%',
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
