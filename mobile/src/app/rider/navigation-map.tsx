import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { useState } from 'react'
import { ThemedText } from '@comp/index'
import Map from '@rnmapbox/maps'
import { useLocalSearchParams } from 'expo-router'


export default function MapView() {
  const { lat, lng } = useLocalSearchParams<{ lat: string, lng: string }>()
  const [ markers, setMarkers ] = useState<{ key: string, coords: { latitude: number, longitude: number }, pinColor: string }[]>([])

  function newMarker(e: { geometry: { coordinates: number[] } }) {
    let data = {
      key: `marker-${Date.now()}`,
      coords: {
        latitude: e.geometry.coordinates[1],
        longitude: e.geometry.coordinates[0],
      },
      pinColor: '#a4210a',
    }

    setMarkers(prev => [...prev, data])
  }

  return(
    <View style={[ styles.cardMaps ]}>
      <ThemedText style={{ paddingHorizontal: 16, paddingVertical: 4 }} type="subtitle">Tetset</ThemedText>
        <Map.MapView style={ styles.map }
          styleURL={Map.StyleURL.Street}
          scaleBarEnabled={false}
          logoEnabled={false}
          attributionEnabled={false}
          onPress={newMarker}
          >
          <Map.Camera
            zoomLevel={17}
            centerCoordinate={[parseFloat(lng), parseFloat(lat)]}
            animationMode={'flyTo'}
            animationDuration={0}
          />
          <Map.UserLocation requestsAlwaysUse={true} visible={true}/>
          {markers.map((marker) => {
            return (
              <Map.PointAnnotation
                key={marker.key}
                id={marker.key}
                coordinate={[marker.coords.longitude, marker.coords.latitude]}
                >
                <View style={[ styles.destination, { backgroundColor: marker.pinColor } ]} />
              </Map.PointAnnotation>
            )
          })}

      </Map.MapView>
    </View>
  )
}

const styles = StyleSheet.create({
  map: {
    width: '100%',
    height: '100%',
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
  },
  destination: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#a4210a',
    borderWidth: 2,
    borderColor: '#e92929',
  }
})