import { useCallback, useMemo, useEffect } from 'react'
import { AppState, AppStateStatus } from 'react-native'
import { socket } from '@/src/websocket/config/socket'
import { TripManager } from '@api/trip-manager'
import { Driver, RouteInfo, Vehicle } from '../types'
import { useRacingStore } from '../context/racing-state'

export type TripState = 'idle' | 'request' | 'match' | 'confirm' | 'in_transit' | 'complete' | 'cancelled'

export interface TripData {
  tripId: string | null
  driver?: Driver & { car: Vehicle }
  rider?: { name: string }
  route?: RouteInfo & { cost: number }
  driverLocation?: { latitude: number, longitude: number }
}

export function useTripEvents() {
  const tripManager = useMemo(() => new TripManager(), [])
  
  // Método para sincronização do estado da corrida
  const syncTripState = useCallback(async () => {
    try {
      const response = await tripManager.existingRunCheck()

      if (response.racingData !== null) {
        useRacingStore.getState().setTripData({ ...response.racingData, driver: { ...response.racingData.driver, car: response.racingData.car } })
        useRacingStore.getState().setTripState(response.state)

        if (response.tripId) {
          socket.emit('join_trip_room', response.tripId)
        }
      }
    } catch (error) {
      console.error('Falha ao sincronizar com a corrida')
    }
  }, [tripManager])

  useEffect(() => {
    const handleDriverMatched = () => useRacingStore.getState().setTripState('match')
    const handleDriverArrived = () => useRacingStore.getState().setTripState('confirm')
    const handleTripStarted = () => useRacingStore.getState().setTripState('in_transit')
    const handleTripCancelled = () => {
      useRacingStore.getState().setTripState('cancelled')
      useRacingStore.getState().setTripData({ tripId: null, driver: undefined, route: undefined })
    }
    const handleTripFinished = () => {
      useRacingStore.getState().setTripState('complete')
    }

    socket.on('driver_matched', handleDriverMatched)
    socket.on('driver_arrived', handleDriverArrived)
    socket.on('trip_started', handleTripStarted)
    socket.on('trip_cancelled', handleTripCancelled)
    socket.on('trip_finished', handleTripFinished)

    const subscription = AppState.addEventListener('change', (next: AppStateStatus) => {
      if (next === 'active') syncTripState()
    })

    syncTripState()

    return () => {
      socket.off('driver_matched', handleDriverMatched)
      socket.off('driver_arrived', handleDriverArrived)
      socket.off('trip_started', handleTripStarted)
      socket.off('trip_cancelled', handleTripCancelled)
      socket.off('trip_finished', handleTripFinished)
      subscription.remove()
    }
  }, [syncTripState])
}