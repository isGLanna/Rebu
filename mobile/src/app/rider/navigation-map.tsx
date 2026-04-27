import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context'
import { useState, useEffect, useCallback, useRef } from 'react'
import Map from '@rnmapbox/maps'
import { TripManager } from '@api/trip-manager'
import { useLocalSearchParams } from 'expo-router'
import { Colors } from '@/src/styles/theme'
import { MapMarkers, DriverMarker } from '@organisms/map-navigation/index'
import type { Driver } from '@comp/../types/rider'
import { BottomSheetModal } from '@gorhom/bottom-sheet'

import IconMD from '@expo/vector-icons/MaterialCommunityIcons'
import { DriverListSheet } from '@/src/components/organisms/map-navigation/driver-list-sheet';
import { Car } from '@/src/types/car';

type MapMarker = {
  key: string,
  coords: {
    latitude: number,
    longitude: number,
  }
}

type RouteInfo = {
  geometry: any;
  distance: string;
  duration: string;
}

Map.setAccessToken(process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN || '')

export default function MapView() {
  const { lat, lng } = useLocalSearchParams<{ lat: string, lng: string }>()
  const [ markers, setMarkers ] = useState<MapMarker[]>([])
  const [ routeData, setRouteData ] = useState<RouteInfo | null>(null)
  const [ isActiveRace, setIsActiveRace ] = useState(false)
  const [ trip, setTrip ] = useState<{driver: Driver} & { car: Car } & { cost: number } | null>(null)
  const bottomSheetModalRef = useRef<BottomSheetModal>(null)

  // Adiciona marcadores no mapa
  const newMarker = (e: { geometry: { coordinates: number[] } }) => {
    if (markers.length >= 3) return alert('Limite de três paradas atingido')

    const newMarkerData: MapMarker = {
      key: `marker-${markers.length}`,
      coords: {
        latitude: e.geometry.coordinates[1],
        longitude: e.geometry.coordinates[0],
      }
    }

    setMarkers((prev) => [...prev, newMarkerData])
  }

  // Bloqueia e solicita nova corrida e indica posição do motorista
  const handleRequestRace = async () => {
    if (isActiveRace || markers.length === 0) return

    setIsActiveRace(true)
    try {
      const response = await TripManager.requestRace()

      if (response.status !== 'success')
        return alert('Não foi possível solicitar a corrida')

      setTrip({ driver: response.driver, car: response.car, cost: 0 })

      handleRaceRoute(response.driver.location)
    } catch (error) {
      alert("Ocorreu um erro ao solicitar a corrida. Tente novamente")
    }
  }

  // Calcula a rota entre origem e destino após aceitar a corrida
  const handleRaceRoute = async (driverLocation: { latitude: number, longitude: number }) => {
    if (!driverLocation)
      return alert('Aguardando um motorista...')

    const route = await TripManager.fetchDirections(
      {latitude: parseFloat(lat), longitude: parseFloat(lng)},
      markers.map(m => m.coords)
    )

    // Caso algo falhe, cancele a corrida e libere para solicitar outra
    if (!route) {
      setTrip(null)
      setIsActiveRace(false)
      return
    }

    setRouteData(route)
    setTrip((prev) => prev ? { ...prev, cost: route.cost } : null)
  }

  // Atualiza posição do motorista após aceitar corrida
  useEffect(() => {
    if (!trip) return

    const requestDriverPosition = setInterval(() => {
        TripManager.driverPosition().then(position => {
          setTrip((prev) => prev ?
            { ...prev, driver: { ...prev.driver, location: position } }
            : null)
      })
    }, 2000)

    return () => clearInterval(requestDriverPosition)
  }, [trip])

  return(
    <SafeAreaView edges={['top']} style={{ flex: 1 }}>
      <View style={[ styles.cardMaps ]}>
          <Map.MapView style={ styles.map }
            styleURL={Map.StyleURL.Street}
            scaleBarEnabled={false}
            logoEnabled={false}
            attributionEnabled={false}
            onPress={isActiveRace ? undefined : newMarker}>
            <Map.Camera
              zoomLevel={17}
              centerCoordinate={[parseFloat(lng), parseFloat(lat)]}
              animationMode={'flyTo'}
              animationDuration={0}
            />
            <Map.UserLocation requestsAlwaysUse={true} visible={true}/>

            {routeData && (
              <Map.ShapeSource id="routeSource" shape={routeData.geometry}>
                <Map.LineLayer id="routeFill" belowLayerID="road-label" style={{ lineColor: Colors.branding._400, lineWidth: 3, lineBorderColor: Colors.branding._300 }} />
              </Map.ShapeSource>
            )}

            <DriverMarker localization={trip?.driver?.location} />

            <MapMarkers markers={markers} isActiveRace={isActiveRace} setMarkers={setMarkers} />
        </Map.MapView>

        {trip &&  // Campo de listagem de motoristas, existe apenas enquanto houver um motorista alocado para a corrida
          <DriverListSheet driver={trip.driver} car={trip.car} cost={trip.cost} />
        }

        {!trip && // Botão para solicitar corrida, aparece apenas enquanto não houver solicitado motoristas
          <TouchableOpacity style={styles.advanceIcon} activeOpacity={0.6} onPress={() => handleRequestRace()}>
            <IconMD name="car-arrow-right" size={32} color='#fff' />
          </TouchableOpacity>
        }
      </View>
    </SafeAreaView>

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
  advanceIcon: {
    position: 'absolute',
    backgroundColor: Colors.branding._500,
    borderRadius: 24,
    bottom: 24,
    right: 24,
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
})