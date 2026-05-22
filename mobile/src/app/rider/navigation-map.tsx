import { StyleSheet, TouchableOpacity, View, AppState } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context'
import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import Map from '@rnmapbox/maps'
import { TripManager } from '@api/trip-manager'
import { useLocalSearchParams } from 'expo-router'
import { Colors } from '@/src/styles/theme'
import { MapMarkers, DriverMarker } from '@organisms/map-navigation/index'
import type { Driver } from '@comp/../types/rider'
import IconMD from '@expo/vector-icons/MaterialCommunityIcons'
import { DriverListSheet } from '@organisms/map-navigation/driver-list-sheet';
import { Car } from '@/src/types/car';
import { RouteInfo } from '@/src/types/trip'
import { socket } from '@service/socket'

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

  const [isSearchingDriver, setIsSearchingDriver] = useState(false)
  const [isRaceAccepted, setIsRaceAccepted] = useState(false)

  const [pendingTrip, setPendingTrip] = useState<{ route: RouteInfo, cost: number, distance: string, duration: string } | null>(null)
  const [activeTrip, setActiveTrip] = useState<{ driver: Driver, car: Car } | null>(null)
  const [selectedDriver, setSelectedDriver] = useState<{ driver: Driver, car: Car } | null>(null)

  const tripManager = useMemo(() => new TripManager(), [])
  const appState = useRef(AppState.currentState)

  // TODO: implementar um busy waiting para aguardar resposta do servidor
  const waitForAvailableDriver = useCallback(() => {
      return new Promise<{ driver: Driver, car: Car }>((resolve, reject) => {
        const cleanup = () => {
          socket.off('active')
          socket.off('driver_assigned')
          socket.off('cancelled')
        }
      
        socket.once('active', (driverData: { driver: Driver, car: Car }) => {
          cleanup()
          resolve(driverData)
        })

        // Se o usuário cancelar a busca encerra-se a promise
        socket.once('cancelled', () => {
          cleanup()
          reject(new Error('Nenhum motorista pôde aceitar no momento'))
        })
        
        // EM BACKEGROUND
        if (appState.current === 'background') {
          let pollingInterval = setInterval(() => {
            tripManager.checkExistingRace().then(response => {
              if (response.status === 'success' && response.driverData)
                resolve(response.driverData)
            })
          }, 2000)
        }
      })
  }, [ appState.current ])

  // Verifica estados de corrida ao montar componente
  useEffect(() => {
    tripManager.checkExistingRace().then(response => {
      if (response.status === 'success' && response.driverData) {
        setSelectedDriver({
          driver: response.driverData.driver,
          car: response.driverData.car,
        })
        setIsRaceAccepted(true)
      }
    })
  }, [])

  const newMarker = useCallback((e: { geometry: { coordinates: number[] } }) => {
    if (markers.length >= 3 && (changedStartingPoint && markers.length >= 4)) return alert('Limite de três paradas atingido')
    if (isSearchingDriver || isRaceAccepted) return
    
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
  }, [markers, changedStartingPoint, startingPoint, isSearchingDriver, isRaceAccepted])

  const handleRequestRace = useCallback(async () => {
    if (isRaceAccepted || markers.length === 0 || (changedStartingPoint && markers.length === 1)) return

    setIsSearchingDriver(true)
    try {
      const { latitude, longitude } = changedStartingPoint ? markers[0].coords : { latitude: parseFloat(lat), longitude: parseFloat(lng) }
      const response = await tripManager.requestRace(
        { latitude, longitude },
        markers.map(m => m.coords)
      )

      if (!response.success) {
        throw new Error(response.message || 'Não foi possível solicitar a corrida')
      }

      setPendingTrip({
        route: { geometry: response.geometry as any, distance: response.distance, duration: response.duration },
        cost: response.cost,
        distance: response.distance,
        duration: response.duration
      })

      const trip = await waitForAvailableDriver()

      if (!trip) throw new Error('Nenhum motorista disponível no momento')

      setActiveTrip({
        driver: trip.driver,
        car: trip.car
      })

      setSelectedDriver({
        driver: trip.driver,
        car: trip.car,
      })

      setIsSearchingDriver(false)
    } catch (error: any) {
      setIsSearchingDriver(false)
      alert(error.message || error || 'Ocorreu um erro ao solicitar a corrida. Tente novamente.')
    }
  }, [isRaceAccepted, markers, startingPoint, changedStartingPoint, waitForAvailableDriver])

  const handleRequestNewDriver = useCallback(async () => {
    try {
      setIsSearchingDriver(true)
      setActiveTrip(null)
      const response = await tripManager.requestRace(
        { latitude: startingPoint.latitude, longitude: startingPoint.longitude },
        markers.map(m => m.coords)
      )

      if (!response.success) {
        throw new Error('message' in response ? response.message : 'Não foi possível solicitar a corrida')
      }

      const trip = await waitForAvailableDriver()

      if (!trip) throw new Error('Nenhum motorista disponível no momento')

      setActiveTrip({
        driver: trip.driver,
        car: trip.car
      })

      setSelectedDriver({
        driver: trip.driver,
        car: trip.car,
      })

      setIsSearchingDriver(false)
    } catch (error: any) {
      setActiveTrip(null)
      setIsSearchingDriver(false)
      alert(error.message || error || 'Ocorreu um erro ao solicitar um novo motorista. Tente novamente.')
    }
  }, [markers, startingPoint, waitForAvailableDriver])

  const handleCancelSearchRace = useCallback(() => {
    setPendingTrip(null)
    setIsSearchingDriver(false)
  }, [])


  const handleAcceptRace = useCallback(async (driver: Omit<Driver, 'location'>, car: Car) => {
    if (!pendingTrip) return;

    try {
      const response = await tripManager.acceptRace()

      if (response.status !== 'success')
        throw new Error('Não foi possível aceitar a corrida')

      setSelectedDriver({
        driver: { ...driver, location: response.driverLocation },
        car
      })
      
      setIsSearchingDriver(false)
      setIsRaceAccepted(true)
    } catch (error: any) {
      alert(error.message || error || 'Ocorreu um erro ao aceitar a corrida. Tente novamente.')
    }
  }, [pendingTrip])

  useEffect(() => {
    if (!activeTrip) return

    const requestDriverPosition = setInterval(() => {
      tripManager.driverPosition().then(coordinates => {
        setSelectedDriver(prev => prev ? {
          ...prev, driver: {
            ...prev.driver,
            location: coordinates
          }
        } : null)
      })
    }, 2000)

    return () => clearInterval(requestDriverPosition)
  }, [activeTrip])

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

            {pendingTrip && (
              <Map.ShapeSource id="routeSource" shape={pendingTrip?.route.geometry as any}>
                <Map.LineLayer id="routeFill" belowLayerID="road-label" style={{ lineColor: Colors.branding._400, lineWidth: 3, lineBorderColor: Colors.branding._300 }} />
              </Map.ShapeSource>
            )}

            {selectedDriver?.driver.location && (
              <DriverMarker localization={selectedDriver.driver.location} />
            )}

            <MapMarkers markers={markers} isSearchingDriver={isSearchingDriver} setMarkers={setMarkers} isStartingPoint={changedStartingPoint} />
        </Map.MapView>

        {pendingTrip &&
          <DriverListSheet tripInfo={{ driver: activeTrip?.driver, car: activeTrip?.car, cost: pendingTrip.cost, distance: pendingTrip.distance }} onAccept={handleAcceptRace} onCancel={handleCancelSearchRace} onRequestNewDriver={handleRequestNewDriver}/>
        }
        
        <TouchableOpacity style={styles.bottomLeftIcon} activeOpacity={0.7} onPress={() => setChangedStartingPoint(prev => !prev)}>
          {changedStartingPoint ?
            <IconMD name='pin' size={32} color='#fff' /> :
            <IconMD name='pin-outline' size={32} color='#fff' />}
        </TouchableOpacity>

        {(!isSearchingDriver && !isRaceAccepted) &&
          <TouchableOpacity style={styles.bottomRightIcon} activeOpacity={0.7} onPress={handleRequestRace}>
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