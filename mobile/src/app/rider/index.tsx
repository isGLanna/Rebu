import { ThemedView, ThemedText } from '@comp/index'
import { StyleSheet, View, TouchableOpacity } from 'react-native'
import { MapView } from '@organisms/index'
import { useState, useEffect } from 'react'
import * as Location from 'expo-location'
import Map from "@rnmapbox/maps"
import { useThemeColor } from '@/src/hooks/use-theme-color'

Map.setAccessToken("pk.eyJ1IjoiZ2lvcmRhbm9sYW5uYSIsImEiOiJjbW8wdDV2NTcwYzlwMnhveTVja3htdTRzIn0.hNzDdxjqav0FBkeRIsag0w")

export default function Home() {
  const [ location, setLocation ] = useState<Location.LocationObject | null>(null)
  const [ errorMsg, setErrorMsg ] = useState<string | null>(null)
  const borderColor = useThemeColor({}, 'border')

  useEffect(() => {
    async function getLocation() {
      let { status } = await Location.requestForegroundPermissionsAsync()
      if (status !== 'granted') {
        setErrorMsg('Permissão de localização negada')
        return
      }

      let location = await Location.getCurrentPositionAsync({})
      setLocation(location)
    }

    getLocation()
  }, [])

  return (
    <ThemedView style={ styles.container }>
      <MapView location={location?.coords} errorMsg={errorMsg} />

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
    borderColor: '#b32a2a',
    overflow: 'hidden',
  }
})