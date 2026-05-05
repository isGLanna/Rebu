import Map from '@rnmapbox/maps'
import Icon from '@expo/vector-icons/Fontisto'
import IconMD from '@expo/vector-icons/MaterialCommunityIcons'
import { Image } from 'react-native'
import Pin from '@comp/assets/pin-icon.png'
import { Colors } from '@/src/styles/theme'

type MapMarker = {
  key: string,
  coords: {
    latitude: number,
    longitude: number,
  },
}

interface MapMarkersProps {
  markers: MapMarker[],
  isSearchingDriver: boolean,
  setMarkers: (markers: MapMarker[]) => void,
  isStartingPoint: boolean
}

export function MapMarkers({ markers, isSearchingDriver, setMarkers, isStartingPoint }: MapMarkersProps) {
  return (
    <>
      {markers.map((marker, index) => {
        return <Map.PointAnnotation
          id={marker.key}
          key={marker.key}
          coordinate={[marker.coords.longitude, marker.coords.latitude]}
          onSelected={() => isSearchingDriver ? null : setMarkers(markers.filter(m => m.key !== marker.key))}
          >
            {isStartingPoint && index === 0 ? (
              <Image source={Pin} style={{ width: 40, height: 40 }} />
            ) : (
              <Icon name="map-marker-alt" style={{ color: Colors.red._500 }} size={24} />
            )}
          
        </Map.PointAnnotation>
      })}
    </>
  )
}