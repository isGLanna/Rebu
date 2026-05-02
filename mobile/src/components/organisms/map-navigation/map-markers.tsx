import Map from '@rnmapbox/maps'
import Icon from '@expo/vector-icons/Fontisto'
import IconMD from '@expo/vector-icons/MaterialCommunityIcons'
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
          key={marker.key}
          id={marker.key}
          coordinate={[marker.coords.longitude, marker.coords.latitude]}
          onSelected={() => isSearchingDriver ? null : setMarkers(markers.filter(m => m.key !== marker.key))}
          >
            {isStartingPoint && index === 0 ? (
              <IconMD name="pin" style={{ color: Colors.red._500 }} size={24} />
            ) : (
              <Icon name="map-marker-alt" style={{ color: Colors.red._500 }} size={24} />
            )}
          
        </Map.PointAnnotation>
      })}
    </>
  )
}