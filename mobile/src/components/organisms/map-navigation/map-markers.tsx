import Map from '@rnmapbox/maps'
import Icon from '@expo/vector-icons/Fontisto'
import { Colors } from '@/src/styles/theme'

type MapMarker = {
  key: string,
  coords: {
    latitude: number,
    longitude: number,
  }
}

interface MapMarkersProps {
  markers: MapMarker[],
  isActiveRace: boolean,
  setMarkers: (markers: MapMarker[]) => void
}

export function MapMarkers({ markers, isActiveRace, setMarkers }: MapMarkersProps) {
  return (
    <>
      {markers.map((marker) => {
        return <Map.PointAnnotation
          key={marker.key}
          id={marker.key}
          coordinate={[marker.coords.longitude, marker.coords.latitude]}
          onSelected={() => isActiveRace ? null : setMarkers(markers.filter(m => m.key !== marker.key))}
          >
          <Icon name="map-marker-alt" style={{ color: Colors.red._500 }} size={24} />
        </Map.PointAnnotation>
      })}
    </>
  )
}