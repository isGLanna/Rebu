import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context'
import { useState, useEffect, useCallback, useMemo } from 'react'
import Map from '@rnmapbox/maps'
import { TripManager } from '@api/trip-manager'
import { useLocalSearchParams } from 'expo-router'
import { Colors } from '@/src/styles/theme'
import { MapMarkers, DriverMarker } from '@organisms/map-navigation/index'
import type { Driver } from '@comp/../types/rider'
import IconMD from '@expo/vector-icons/MaterialCommunityIcons'
import { DriverListSheet } from '@/src/components/organisms/map-navigation/driver-list-sheet';
import { Car } from '@/src/types/car';
import { RouteInfo } from '@/src/types/trip'

type MapMarker = {
  key: string,
  coords: {
    latitude: number,
    longitude: number,
  }
}

Map.setAccessToken(process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN || '')

export default function MapView() {
  // Coordenadas e Marcadores
  const { lat, lng } = useLocalSearchParams<{ lat: string, lng: string }>()
  const initialCenterCoordinate = useMemo(() => [parseFloat(lng), parseFloat(lat)], [lat, lng])
  const [markers, setMarkers] = useState<MapMarker[]>([])

  //Controladores de estados da corrida
  const [isSearchingDriver, setIsSearchingDriver] = useState(false)
  const [isRaceAccepted, setIsRaceAccepted] = useState(false)

  const [pendingTrip, setPendingTrip] = useState<{ route: RouteInfo, cost: number } | null>(null)
  const [activeTrip, setActiveTrip] = useState<{drivers: {driver: Driver, car: Car }[] } | null>(null)
  const [selectedDriver, setSelectedDriver] = useState<{ driver: Driver, car: Car, cost: number } | null>(null)

  // Verifica se há corrida existente ao montar componente
  useEffect(() => {
    TripManager.checkExistingRace().then(response => {
      if (response.status === 'success' && response.trip) {
        setSelectedDriver({
          driver: response.trip.driver,
          car: response.trip.car,
          cost: response.trip.cost
        })
        setIsRaceAccepted(true)
      }
    })
  }, [])

  // Adiciona marcadores no mapa
  const newMarker = useCallback((e: { geometry: { coordinates: number[] } }) => {
    if (markers.length >= 3) return alert('Limite de três paradas atingido')

    const newMarkerData: MapMarker = {
      key: `marker-${Date.now()}`,
      coords: {
        latitude: e.geometry.coordinates[1],
        longitude: e.geometry.coordinates[0],
      }
    }

    setMarkers((prev) => [...prev, newMarkerData])
  }, [markers])

  // Solicita corrida 
  const handleRequestRace = useCallback(async () => {
    if (isRaceAccepted || markers.length === 0) return

    setIsSearchingDriver(true)
    try {
      const response = await TripManager.requestRace(
        { latitude: initialCenterCoordinate[1], longitude: initialCenterCoordinate[0] },
        markers.map(m => m.coords)
      )

      if (response.status !== 'success')
        throw new Error('Não foi possível solicitar a corrida')

      setPendingTrip({
        route: { geometry: response.geometry, distance: response.distance, duration: response.duration },
        cost: response.cost
      })

      setActiveTrip({
        drivers: response.trip.drivers.map((driverInfo) => ({
          driver: {
            name: driverInfo.driver.name,
            rating: driverInfo.driver.rating,
            location: { latitude: 0, longitude: 0 }
          },
          car: {
            make: driverInfo.car.make,
            model: driverInfo.car.model,
            licensePlate: driverInfo.car.licensePlate,
            color: driverInfo.car.color
          }
        }))
      })

      setIsSearchingDriver(false)
    } catch (error) {
      setIsSearchingDriver(false)
      alert(error || 'Ocorreu um erro ao solicitar a corrida. Tente novamente.')
    }
  }, [isRaceAccepted, markers, initialCenterCoordinate])

  // Cancela a busca de motoristas
  const handleCancelSearchRace = useCallback(() => {
    setPendingTrip(null)
    setIsSearchingDriver(false)
  }, [])


  const handleAcceptRace = useCallback(async (driver: Omit<Driver, 'location'>, car: Car) => {
    if (!pendingTrip) return;

    try {
      const response = await TripManager.acceptRace()

      if (response.status !== 'success')
        throw new Error('Não foi possível aceitar a corrida')

      setSelectedDriver({
        driver: { ...driver, location: response.driverLocation },
        car,
        cost: pendingTrip.cost
      })
      
      setIsSearchingDriver(false)
      setIsRaceAccepted(true)
    } catch (error) {
      alert(error || 'Ocorreu um erro ao aceitar a corrida. Tente novamente.')
    }
  }, [pendingTrip])

  useEffect(() => {
    if (!isRaceAccepted || !activeTrip) return

    const requestDriverPosition = setInterval(() => {
      TripManager.driverPosition().then(coordinates => {
        setSelectedDriver(prev => prev ? {
          ...prev, driver: {
            ...prev.driver,
            location: coordinates
          }
        } : null)
      })
    }, 2000)

    return () => clearInterval(requestDriverPosition)
  }, [isRaceAccepted])

  return(
    <SafeAreaView edges={['top']} style={{ flex: 1 }}>
      <View style={[ styles.cardMaps ]}>
          <Map.MapView style={ styles.map }
            styleURL={Map.StyleURL.Street}
            scaleBarEnabled={false}
            logoEnabled={false}
            attributionEnabled={false}
            onPress={(isSearchingDriver || isRaceAccepted) ? undefined : newMarker}
          >
            <Map.Camera
              zoomLevel={16}
              centerCoordinate={initialCenterCoordinate}
              animationMode={'flyTo'}
              animationDuration={0}
            />
            <Map.UserLocation requestsAlwaysUse={true} visible={true}/>

            {pendingTrip && (
              <Map.ShapeSource id="routeSource" shape={pendingTrip?.route.geometry}>
                <Map.LineLayer id="routeFill" belowLayerID="road-label" style={{ lineColor: Colors.branding._400, lineWidth: 3, lineBorderColor: Colors.branding._300 }} />
              </Map.ShapeSource>
            )}

            {selectedDriver?.driver.location && (
              <DriverMarker localization={selectedDriver.driver.location} />
            )}

            <MapMarkers markers={markers} isSearchingDriver={isSearchingDriver} setMarkers={setMarkers} />
        </Map.MapView>

        {activeTrip && pendingTrip &&         // Lista de motoristas disponíveis para corrida
          <DriverListSheet tripInfo={{ drivers: activeTrip.drivers, cost: pendingTrip.cost }} onAccept={handleAcceptRace} onCancel={handleCancelSearchRace}/>
        }

        {(!isSearchingDriver && !isRaceAccepted) &&
          <TouchableOpacity style={styles.advanceIcon} activeOpacity={0.6} onPress={handleRequestRace}>
            <IconMD name="car-arrow-right" size={32} color='#fff' />
          </TouchableOpacity>
        }
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  map: { width: '100%', height: '100%' },
  cardMaps: { width: '100%', borderRadius: 16, borderWidth: 1, overflow: 'hidden' },
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