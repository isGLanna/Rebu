import Map from '@rnmapbox/maps'
import IconMD from '@expo/vector-icons/MaterialCommunityIcons'

interface DriverMarkerProps{
  localization: {
    latitude: number,
    longitude: number
  } | undefined
}

export function DriverMarker({ localization }: DriverMarkerProps ) {
  return (
    <>
      {localization && (
        <Map.PointAnnotation
          key={'driver'}
          id={'driver'}
          coordinate={[localization.longitude, localization.latitude]}
        >
          <IconMD name="car" size={32} color='#fff' />
        </Map.PointAnnotation>
      )}
    </>
  )
}