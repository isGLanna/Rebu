import { ThemedView, ThemedText } from '@comp/index'
import { StyleSheet, View, TouchableOpacity } from 'react-native'
import { MapView } from '@organisms/index'
import { useState, useEffect } from 'react'
import * as Location from 'expo-location'
import { useThemeColor } from '@/src/hooks/use-theme-color'
import { Loading } from './loading'

export default function Home() {
  const [ errorMsg, setErrorMsg ] = useState<string | null>(null)
  const [ location, setLocation ] = useState<{latitude: number, longitude: number} | null>(null)
  const borderColor = useThemeColor({}, 'border')

  useEffect(() => {
    async function getLocation() {
      let { status } = await Location.requestForegroundPermissionsAsync()
      if (status !== 'granted') {
        setErrorMsg('Permissão de localização negada')
        return
      }
      await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Highest }).
        then(location => {
          setLocation(location.coords)
      })
    }
    getLocation()
  }, [])

  if (location === null) {
    return (
      <Loading />
    )
  }

  return (
    <ThemedView style={ styles.container }>
      <MapView location={location} errorMsg={errorMsg} />
      <View style={[ styles.cardMaps, { borderColor: borderColor } ]}>
        <TouchableOpacity style={[ styles.map, { alignItems: 'center', justifyContent: 'center' } ]} >
          <ThemedText type='subtitle'>Criar destino</ThemedText>
        </TouchableOpacity>
      </View>
    </ThemedView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    gap: 16,
  },
  span: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  map: {
    width: '100%',
    height: 120,
  },
  cardMaps: {
    width: '100%',
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  }
})