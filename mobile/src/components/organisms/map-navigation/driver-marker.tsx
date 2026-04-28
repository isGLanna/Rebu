import Map from '@rnmapbox/maps'
import { Model, FilamentView, RenderCallback,Float3, FilamentScene, Camera, DefaultLight, useSyncSharedValue } from "react-native-filament"
import Car from '@comp/assets/car3d.glb'
import { StyleSheet, View } from 'react-native'

interface DriverMarkerProps {
  localization: {
    latitude: number,
    longitude: number,
  }
}

export function DriverMarker({localization}: DriverMarkerProps) {

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