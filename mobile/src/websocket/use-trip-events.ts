import { useCallback, useMemo, useEffect } from 'react'
import { AppState, AppStateStatus } from 'react-native'
import { socket } from '@/src/websocket/config/socket'
import { TripManager } from '@api/trip-manager'
import { useRacingStore } from '../context/racing-state'

export type TripState = 'idle' | 'request' | 'match' | 'confirm' | 'in_transit' | 'complete' | 'cancelled'

export function useTripEvents() {
  const tripManager = useMemo(() => new TripManager(), [])
  
  // Método para sincronização do estado da corrida
  const syncTripState = useCallback(async (tripId: string) => {
    const res = await tripManager.getTripDetails(tripId)
    if(!res.success || !res.data) return

    const data = res.data
    useRacingStore.getState().setTripData({
      tripId: data.id,
      rider: data.passageiro_nome ? 
      {
        name: data.passageiro_nome,
        phone: data.passageiro_telefone
      } : undefined,
      route: {
        cost: Number(data.valor) || 0,
        geometry: data.geometry,
        distance: data.distancia_km || 'N/A',
        duration: data.duracao_min || 'N/A'
      },
      destination: data.destino || undefined
    })
  }, [tripManager])

  useEffect(() => {
    const handleStateChanged = ({ tripId, status, finalCost }: { tripId: string, status: TripState, finalCost?: number }) => {
      useRacingStore.getState().setTripState(status)

      if(status === 'match' && tripId) {
        useRacingStore.getState().setTripData({ tripId })
        socket.emit('join_trip_room', tripId )
        syncTripState(tripId)
      }


      if(status === 'complete' || status === 'cancelled')
        useRacingStore.getState().setTripData({ tripId: null, driver: undefined, route: undefined })
    }

    const handleLocationUpdated = (coords: { latitude: number, longitude: number }) => {
      useRacingStore.getState().setTripData({ driverLocation: coords})
    }

    socket.on('trip_state_changed', handleStateChanged)
    socket.on('update_location', handleLocationUpdated)

    const subscription = AppState.addEventListener('change', (next: AppStateStatus) => {
      if (next === 'active') {
        const { tripId } = useRacingStore.getState().tripData
        if (tripId) {
          syncTripState(tripId)
        }
      }
    })

    return () => {
      socket.off('trip_state_changed', handleStateChanged)
      socket.off('update_location', handleLocationUpdated)
      subscription.remove()
    }
  }, [syncTripState])
}