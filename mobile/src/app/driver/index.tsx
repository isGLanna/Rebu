import { ThemedView, ThemedText } from '@comp/index'
import { StyleSheet } from 'react-native'
import { useState, useEffect } from 'react'
import * as Location from 'expo-location'
import Map from "@rnmapbox/maps"

Map.setAccessToken("pk.eyJ1IjoiZ2lvcmRhbm9sYW5uYSIsImEiOiJjbW8wdDV2NTcwYzlwMnhveTVja3htdTRzIn0.hNzDdxjqav0FBkeRIsag0w")

export default function Home() {
  const [ location, setLocation ] = useState<Location.LocationObject | null>(null)
  const [ errorMsg, setErrorMsg ] = useState<string | null>(null)

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

  if (errorMsg) {
    return (
      <ThemedView style={ styles.container }>
        <ThemedText style={ styles.span }>Não possui permissão de localização</ThemedText>
      </ThemedView>
    )
  }

  if (!location) {
    return (
      <ThemedView style={ styles.container }>
        {/* Adicionar skeleton */}
        <ThemedText style={ styles.span }>Obtendo localização...</ThemedText>
      </ThemedView>
    )
  }

  return (
    <ThemedView style={{ flex: 1 }}>
      <Map.MapView style={ styles.map }
        styleURL={Map.StyleURL.Street}
      >
        <Map.Camera
          zoomLevel={14}
          centerCoordinate={[location.coords.longitude, location.coords.latitude]}
          animationMode={'flyTo'}
          animationDuration={0}
        />
      </Map.MapView>
    </ThemedView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  span: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  map: {
    flex: 1,
  }
})