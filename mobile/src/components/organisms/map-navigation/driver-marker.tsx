import Map from '@rnmapbox/maps'
import * as Location from 'expo-location'
import { useContext } from 'react'
import { useEffect } from 'react'
import { useSharedValue } from "react-native-worklets-core"
import { Model, FilamentView, RenderCallback,Float3, FilamentScene, Camera, DefaultLight, useSyncSharedValue } from "react-native-filament"
import Car from '@comp/assets/car3d.glb'
import { StyleSheet, View } from 'react-native'

const getRotationMatrix = (headingDegrees: number, tiltDegrees: number = 45): Float3 => {
  'worklet'
  const headingRad = headingDegrees * (Math.PI / 180)
  const tiltRad = tiltDegrees * (Math.PI / 180)

  return [tiltRad, headingRad, 0]
}

interface DriverMarkerProps {
  localization: {
    latitude: number,
    longitude: number,
  }
}

export function DriverMarker({localization}: DriverMarkerProps) {
  const carRotation = useSharedValue<Float3>([0.5, 1.6, 1.5])

  // Obter direção do motorista
  /*
  useEffect(() => {
    let locationSubscription: Location.LocationSubscription | null = null

    const watchLocation = async () => {
      locationSubscription = await Location.watchPositionAsync({
        accuracy: Location.Accuracy.High,
        timeInterval: 2000,
        distanceInterval: 10,
      }, (newLocation) => {
        carRotation.value = getRotationMatrix(newLocation.coords.heading || 0)
      })
    }

    watchLocation()

    return () => {
      if (locationSubscription) locationSubscription.remove()
    }
  }, [])
  */


  return (
    <>
      {localization && (
        <Map.MarkerView
          key={'driver-marker'}
          id={'driver-marker'}
          coordinate={[localization.longitude, localization.latitude]}
          anchor={{ x: 0.5, y: 0.5 }}
        >
          <View style={{ width: 80, height: 80 }}>
            <FilamentScene>
              <FilamentView style={styles.car}>
                <DefaultLight />
                <Model source={Car} />
                <Camera />
              </FilamentView>
            </FilamentScene>
          </View>


        </Map.MarkerView>
      )}
    </>
  )
}

const styles = StyleSheet.create({
  car: {
    width: '100%',
    height: '100%',
  }
})