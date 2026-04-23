import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { ThemedText } from '@comp/index'
import Map from '@rnmapbox/maps'
import { useThemeColor } from '@/src/hooks/use-theme-color'

interface MapViewProps {
  location?: { latitude: number, longitude: number }
  errorMsg?: string | null
}

export function MapView({ location, errorMsg }: MapViewProps) {
  const borderColor = useThemeColor({}, 'border')

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
      <TouchableOpacity style={ styles.map } >
        <Map.MapView style={ styles.map }
          styleURL={Map.StyleURL.Street}
          scaleBarEnabled={false}
          logoEnabled={false}
          >
          <Map.Camera
            zoomLevel={14}
            centerCoordinate={[location.longitude, location.latitude]}
            animationMode={'flyTo'}
            animationDuration={0}
          />
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
    borderColor: '#b32a2a',
    overflow: 'hidden',
  }
})