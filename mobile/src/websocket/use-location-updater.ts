import { socket } from './config/socket'
import { useEffect } from 'react'
import { useRacingStore } from '../context/racing-state'

export interface TripData {
  tripId: string | null
  driverLocation?: { latitude: number, longitude: number }
}

/**
 * Método de sincronização para atualizar estado de localização do motorista. Método socket informa a localização de tempos em tempos(pooling do motorista).
 */
export function useLocationUpdater() {
  // Cria uma porta para receber atualizações de localização do motorista para o id da corrida atual
  useEffect(() => {
    const handleLocationUpdate = (coords: {latitude: number, longitude: number}) => {
      useRacingStore.getState().setTripData({ driverLocation: coords })
    }

    socket.on('current_location', handleLocationUpdate)
    return () => {
      socket.off('current_location', handleLocationUpdate)
    }
  }, [])
}