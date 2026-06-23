import { useState, useEffect, useMemo, useCallback } from 'react'
import { useRacingStore } from '@context/racing-state'
import { useLocationEmitter } from '@socket/location-emitter'
import { ThemedView, ThemedText } from '@comp/index'
import { TripManager } from '@/src/api/trip-manager'
import { Colors } from '@/src/styles/theme'
import { useToast } from '@context/toast-context'
import { StyleSheet } from 'react-native'
import Map from "@rnmapbox/maps"
import { RiderListSheet } from '@organisms/map-navigation/rider-list-sheet'
import { useLocalSearchParams } from 'expo-router'


Map.setAccessToken(process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN || '')

export default function MapView() {
  const { lat, lng } = useLocalSearchParams<{ lat: string, lng: string }>()
  const [ errorMsg, ] = useState<string | null>(null)
  const [ isLoading, setIsLoading ] = useState<boolean>(false)
  const tripManager = useMemo(() => new TripManager(), [])
  const { tripState, tripData, setTripData } = useRacingStore()
  const { showToast } = useToast()
  const { tripId, route, rider } = tripData

  useLocationEmitter()

  useEffect(() => {
    if (tripId && !rider) {
      tripManager.getTripDetails(tripId).then(res => {
        if (res.success && res.data) {
          alert(JSON.stringify(res.data))
          setTripData({
            rider: { name: res.data.passageiro_id },
            route: {
              cost: Number(res.data.valor) || 0,
              geometry: res.data.geometry, 
              distance: res.data.distancia_km || 'N/A',
              duration: res.data.duracao_min || 'N/A'
            }
          })
        }
      })
    }
  }, [tripId, rider])

  const handleAction = useCallback(async (actionFn: () => Promise<{success: boolean, message?: string}>) => {
    if (tripState === 'request' || !tripId || !location) return

    setIsLoading(true)
    try {
      const res = await actionFn()
      if (!res.success) throw new Error(res.message || 'Erro ao aceitar corrida')
    } catch (error: any) {
      showToast('Erro', error.message || 'Ocorreu um erro ao aceitar a corrida.')
    } finally {
      setIsLoading(false)
    }
  }, [tripState, tripId, tripManager, location])

  if (errorMsg) {
    return (
      <ThemedView style={ styles.container }>
        <ThemedText style={ styles.span }>Não possui permissão de localização</ThemedText>
      </ThemedView>
    )
  }

  if (!location) {
    return (
      <ThemedView style={ styles.container }>
        {/* Adicionar skeleton */}
        <ThemedText style={ styles.span }>Obtendo localização...</ThemedText>
      </ThemedView>
    )
  }

  return (
    <ThemedView style={{ flex: 1 }}>
      <Map.MapView 
        style={ styles.cardMaps }
        styleURL={Map.StyleURL.Street}
        scaleBarEnabled={false}
        logoEnabled={false}
        attributionEnabled={false}
        >
        <Map.Camera
          zoomLevel={14}
          centerCoordinate={[parseFloat(lng), parseFloat(lat)]}
          pitch={60}
          animationMode={'flyTo'}
          animationDuration={1000}
          followUserLocation={true}
          followZoomLevel={18}
          followPitch={60}
          followUserMode={Map.UserTrackingMode.FollowWithHeading}
        />
        <Map.UserLocation requestsAlwaysUse={true} visible={true} showsUserHeadingIndicator={true}/>

        {route && tripState !== 'idle' && tripState !== 'request' && (
          <Map.ShapeSource id="routeSource" shape={route.geometry}>
            <Map.LineLayer id="routeFill" belowLayerID="road-label" style={{ lineColor: Colors.branding._500, lineWidth: 5 }} />
          </Map.ShapeSource>
        )}
      </Map.MapView>

      <RiderListSheet
        tripState={tripState}
        isLoading={isLoading}
        tripInfo={{
          rider: rider,
          cost: route?.cost,
          distance: route?.distance,
          duration: route?.duration
        }}
        onAccept={() => handleAction(() => tripManager.acceptRace(tripId!))}
        onArrive={() => handleAction(() => tripManager.arriveAtLocation(tripId!))}
        onStart={() => handleAction(() => tripManager.startTrip(tripId!))}
        onFinish={() => handleAction(() => tripManager.finishTrip(tripId!))}
      />
    </ThemedView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  span: {
    fontSize: 24,
    fontWeight: 'semibold',
  },
  cardMaps: {
    height: '100%',
  },
bottomPanel: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    padding: 24,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 10,
  },
  panelTitle: {
    marginBottom: 16,
    textAlign: 'center',
  },
  actionButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledButton: {
    opacity: 0.6,
  }
})