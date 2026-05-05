import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { router, usePathname } from 'expo-router'
import { ThemedText } from '@comp/index'
import Map from '@rnmapbox/maps'
import { useThemeColor } from '@/src/hooks/use-theme-color'

interface MapViewProps {
  location?: { latitude: number, longitude: number }
  errorMsg?: string | null
}

Map.setAccessToken(process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN || '')

export function MapView({ location, errorMsg }: MapViewProps) {
  const borderColor = useThemeColor({}, 'border')
  const accountType = usePathname().includes('driver') ? 'driver' : 'rider'

  if (errorMsg) {
    return (
      <View style={[ styles.cardMaps, { borderColor: borderColor } ]}>
        <ThemedText style={{ paddingHorizontal: 16, paddingVertical: 4 }} type="subtitle">Mapa</ThemedText>
        <TouchableOpacity style={[ styles.map, { alignItems: 'center', justifyContent: 'center' } ]} >
          <ThemedText>Não foi possível obter a localização</ThemedText>
        </TouchableOpacity>
      </View>
    )
  }

  if (!location) {
    return (
      <View style={[ styles.cardMaps, { borderColor: borderColor } ]}>
        <ThemedText style={{ paddingHorizontal: 16, paddingVertical: 4 }} type="subtitle">Mapa</ThemedText>
        <TouchableOpacity style={[ styles.map, { alignItems: 'center', justifyContent: 'center' } ]} >
          <ThemedText>Carregando mapa...</ThemedText>
        </TouchableOpacity>
      </View>
    )
  }

  return(
    <View style={[ styles.cardMaps, { borderColor: borderColor } ]}>
      <ThemedText style={{ paddingHorizontal: 16, paddingVertical: 4 }} type="subtitle">Mapa</ThemedText>
      <TouchableOpacity style={ styles.map } onPress={() => router.push({ pathname: `/${accountType}/navigation-map`, params: { lat: location.latitude, lng: location.longitude }})}>
        <Map.MapView style={ styles.map }
          styleURL={Map.StyleURL.Street}
          scaleBarEnabled={false}
          attributionEnabled={false}
          logoEnabled={false}
          >
          <Map.Camera
            zoomLevel={15}
            centerCoordinate={[location.longitude, location.latitude]}
            animationMode={'flyTo'}
            animationDuration={0}
          />
          <Map.UserLocation requestsAlwaysUse={true} visible={true}/>
      </Map.MapView>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  map: {
    width: '100%',
    height: 120,
  },
  cardMaps: {
    width: '100%',
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  selectedMap: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  }
})