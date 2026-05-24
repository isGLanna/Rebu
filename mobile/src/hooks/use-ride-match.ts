import { useCallback, useState, useEffect } from 'react'
import { AppState, AppStateStatus } from 'react-native'
import { socket } from '@/src/services/socket'
import { TripManager } from '@api/trip-manager'
import { Driver, Race, RouteInfo, Vehicle } from '../types'

export type TripState = 'idle' | 'request' | 'match' | 'confirm' | 'in_transit' | 'complete' | 'cancelled'

export interface TripData {
  tripId: string | null
  driver?: Driver
  car?: Vehicle
  rider?: { name: string }
  route?: RouteInfo
  driverLocation?: { latitude: number, longitude: number }
}


/**
 * Método de sincronização similar Publish/Subscribe que, conforme recebe modificações de estado da corrida, atualiza o estado global da corrida e seus dados relacionados.
 * Inicia tentativa verificando se há corridas e sincroniza os estados ao montar o componente. Depois, mantém portas abertas para receber atualizações sobre o status da corrida.
 */
export function useTripMachine() {
  const [tripState, setTripState] = useState<TripState>('idle')
  const [tripData, setTripData] = useState<TripData>({ tripId: null })

  const tripManager = new TripManager()
  const syncTripState = useCallback(async () => {
    // Sincroniza estado da corrida
    try {
      const response = await tripManager.checkExistingRace()

      if (response.racingData !== null) {
        setTripData(prev => ({ ...prev, ...response, driver: response.racingData!.driver, car: response.racingData!.car }))
        setTripState(response.state)

        // Se houver uma corrida ativa, demonstra interesse em atualizações dessa assinatura(tripId)
        if (response.tripId) {
          socket.emit('join_room', response.tripId)
        }
      }
    } catch (error) {
      console.error('Falha ao sincronizar com a corrida')
    }
  }, [tripState, tripData])

  // Sempre que estado alterar, atualiza o estado e payload
  useEffect(() => {
    socket.on('trip_updated', (data: { status: TripState, payload: Partial<TripData> }) => {
      setTripState(data.status)
      setTripData(prev => ({ ...prev, ...data.payload}))
    })

    socket.on('current_location', (coords: {latitude: number, longitude: number}) => {
      setTripData(prev => ({ ...prev, driverLocation: coords}))
    })

    const subscription = AppState.addEventListener('change', (next: AppStateStatus) => {
      if (next === 'active') {
        syncTripState()
      }
    })

    syncTripState()

    return () => {
      socket.off('trip_updated')
      socket.off('current_location')
      subscription.remove()
    }
  }, [syncTripState])

  return { tripState, tripData, setTripState }
}