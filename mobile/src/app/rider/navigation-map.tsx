import { StyleSheet, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useState, useEffect, useCallback, useMemo } from 'react'
import { TripManager } from '@api/trip-manager'
import { useLocalSearchParams } from 'expo-router'
import { Colors } from '@/src/styles/theme'
import { MapMarkers, DriverMarker } from '@organisms/map-navigation/index'
import type { Driver, Vehicle, RouteInfo } from '@/src/types'
import IconMD from '@expo/vector-icons/MaterialCommunityIcons'
import { DriverListSheet } from '@organisms/map-navigation/driver-list-sheet'
import { useTripMachine } from '@hooks/use-ride-match'
import Map from '@rnmapbox/maps'

type MapMarker = {
  key: string,
  coords: {
    latitude: number,
    longitude: number,
  }
}

Map.setAccessToken(process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN || '')

export default function MapView() {
  const { lat, lng } = useLocalSearchParams<{ lat: string, lng: string }>()
  const [startingPoint, setStartingPoint] = useState<{ latitude: number, longitude: number }>({ latitude: parseFloat(lat), longitude: parseFloat(lng) })
  const [changedStartingPoint, setChangedStartingPoint] = useState<boolean>(false)
  const [markers, setMarkers] = useState<MapMarker[]>([])

  const [tripRequest, setTripRequest] = useState<{ route: RouteInfo, cost: number, distance: string, duration: string } | null>(null)

  const tripManager = useMemo(() => new TripManager(), [])
  const { tripState, tripData, setTripState } = useTripMachine()

  const newMarker = useCallback((e: { geometry: { coordinates: number[] } }) => {
    if (markers.length >= 3 && (changedStartingPoint && markers.length >= 4)) return alert('Limite de três paradas atingido')
    if (tripState !== 'idle') return
    
    if (markers.length === 0 && changedStartingPoint){
      setStartingPoint(({
        latitude: e.geometry.coordinates[1],
        longitude: e.geometry.coordinates[0]
      }))
      setChangedStartingPoint(true)
    }
    const newMarkerData: MapMarker = {
      key: `marker-${Math.random().toString(8)}`,
      coords: {
        latitude: e.geometry.coordinates[1],
        longitude: e.geometry.coordinates[0],
      }
    }
    setMarkers((prev) => [...prev, newMarkerData])
  }, [markers, changedStartingPoint, startingPoint, tripState])

  const requestRace = useCallback(async () => {
    // Impede corridas duplicadas, sem pontos ou mudanças no ponto de partida sem querer
    if (tripState !== 'idle' || markers.length === 0 || (changedStartingPoint && markers.length === 1)) return

    try {
      setTripState('request')
      const { latitude, longitude } = changedStartingPoint ? markers[0].coords : { latitude: parseFloat(lat), longitude: parseFloat(lng) }
      const response = await tripManager.requestRace(
        { latitude, longitude },
        markers.map(m => m.coords)
      )

      if (!response.success) {
        throw new Error(response.message || 'Não foi possível solicitar a corrida')
      }

      setTripRequest({
        route: { geometry: response.geometry as any, distance: response.distance, duration: response.duration },
        cost: response.cost,
        distance: response.distance,
        duration: response.duration
      })

    } catch (error: unknown) {
      setTripState('idle')
      alert((error as Error).message || error || 'Ocorreu um erro ao solicitar a corrida. Tente novamente')
    }
  }, [markers, startingPoint, changedStartingPoint, tripState])

  const requestNewDriver = useCallback(async () => {
    try {
      setTripState('request')
      const response = await tripManager.requestRace(
        { latitude: startingPoint.latitude, longitude: startingPoint.longitude },
        markers.map(m => m.coords)
      )

      if (!response.success) {
        throw new Error('message' in response ? response.message : 'Não foi possível solicitar a corrida')
      }

    } catch (error: any) {
      setTripState('idle')
      alert(error.message || error || 'Ocorreu um erro ao solicitar um novo motorista. Tente novamente')
    }
  }, [markers, startingPoint])

  const cancelSearchRace = useCallback(async () => {
    // TODO: solicita o backend para retirar da fila do redis
    try {
      if (!tripData.tripId) throw new Error('Nenhuma corrida ativa para cancelar')

      const response = await tripManager.cancelRace(tripData.tripId)

      if (response.status !== 200)
        throw new Error('Não foi possível cancelar a corrida')

      setTripState('idle')
      setTripRequest(null)
      
    } catch (error: unknown) {
      alert((error as Error).message || error || 'Não foi possível cancelar a corrida')
    }

  }, [])


  const acceptRace = useCallback(async () => {
    if (!tripRequest) return;

    try {
      setTripState('confirm')
      const response = await tripManager.acceptRace()

      if (response.status !== 'success')
        throw new Error('Não foi possível aceitar a corrida')
      
    } catch (error: unknown) {
      setTripState('match')
      alert((error as Error).message || error || 'Ocorreu um erro ao aceitar a corrida. Tente novamente')
    }
  }, [tripRequest])

  return(
    <SafeAreaView edges={['top']} style={{ flex: 1 }}>
      <View style={[ styles.cardMaps ]}>
          <Map.MapView style={ styles.map }
            styleURL={Map.StyleURL.Street}
            scaleBarEnabled={false}
            logoEnabled={false}
            attributionEnabled={false}
            onPress={newMarker}
          >
            <Map.Camera
              zoomLevel={16}
              centerCoordinate={startingPoint ? [startingPoint.longitude, startingPoint.latitude] : undefined}
              animationMode={'flyTo'}
              animationDuration={0}
            />
            <Map.UserLocation requestsAlwaysUse={true} visible={true}/>

            {tripRequest && ( // Exibe a rota para destino após solicitar corrida
              <Map.ShapeSource id="routeSource" shape={tripRequest?.route.geometry}>
                <Map.LineLayer id="routeFill" belowLayerID="road-label" style={{ lineColor: Colors.branding._400, lineWidth: 3, lineBorderColor: Colors.branding._300 }} />
              </Map.ShapeSource>
            )}

            {tripData?.driver?.location && (    // Quando houver motorista designado, exibe localização do motorista
              <DriverMarker localization={tripData?.driver?.location} />
            )}

            <MapMarkers markers={markers} isSearchingDriver={tripState === 'request'} setMarkers={setMarkers} isStartingPoint={changedStartingPoint} />
        </Map.MapView>

        {tripRequest &&
          <DriverListSheet tripInfo={{ driver: tripData.driver, car: tripData.car, cost: tripRequest.cost, distance: tripRequest.distance }} onAccept={acceptRace} onCancel={cancelSearchRace} onRequestNewDriver={requestNewDriver}/>
        }
        
        <TouchableOpacity style={styles.bottomLeftIcon} activeOpacity={0.7} onPress={() => setChangedStartingPoint(prev => !prev)}>
          {changedStartingPoint ?
            <IconMD name='pin' size={32} color='#fff' /> :
            <IconMD name='pin-outline' size={32} color='#fff' />}
        </TouchableOpacity>

        {(tripState === 'idle') && // Exibe botão de solicitar corrida apenas qunado não houver corrida ativa ou solicitada
          <TouchableOpacity style={styles.bottomRightIcon} activeOpacity={0.7} onPress={requestRace}>
            <IconMD name="car-arrow-right" size={32} color='#fff' />
          </TouchableOpacity>
        }
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  map: { width: '100%', height: '100%' },
  cardMaps: { width: '100%', overflow: 'hidden' },
  bottomRightIcon: {
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
  bottomLeftIcon: {
    position: 'absolute',
    backgroundColor: Colors.branding._500,
    borderRadius: 24,
    bottom: 24,
    left: 24,
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
})