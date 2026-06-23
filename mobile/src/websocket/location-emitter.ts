import { socket } from './config/socket'
import { useEffect, useCallback, useMemo } from 'react'
import { useRacingStore } from '@/src/context/racing-state'
import * as Location from 'expo-location'

/**
 * Método de sincronização para emitir a localização do motorista. Método socket informa a localização de tempos em tempos.
 */
export function useLocationEmitter() {
  const tripId = useRacingStore(state => state.tripData.tripId)
  const tripState = useRacingStore(state => state.tripState)

  useEffect(() => {
    let locationSubscription: Location.LocationSubscription | null = null
    const sendLocation = async () => {
      // Enquanto houver uma corrida ativa, emite localização a cada atualização
      if (tripState === 'idle' || tripState === 'cancelled' || tripState === 'complete') return

      locationSubscription = await Location.watchPositionAsync(
        { 
          accuracy: Location.Accuracy.High, 
          distanceInterval: 15,
          timeInterval: 3000
        },
        (location) => {
          socket.emit('update_location', {
            tripId,
            coords: {
              latitude: location.coords.latitude,
              longitude: location.coords.longitude
            }
          })
        }
      )
    }

    sendLocation()

    return () => {
      if (locationSubscription) 
        locationSubscription.remove()
    }
  }, [tripId, tripState])
}