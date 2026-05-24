import type { Race, RequestRaceResponse, RouteInfo } from '@/src/types/trip'
import { authenticate } from './auth'
import { TripState } from '../hooks/use-ride-match';

const baseUrl = process.env.EXPO_BASE_URL || 'http://192.168.3.82:3001'
const header = {'Content-Type': 'application/json'}

export class TripManager {
  // enviar requisição com token de validação
  async requestRace(origin: { latitude: number, longitude: number }, waypoints: { latitude: number, longitude: number }[]): Promise<| { success: true; cost: number; geometry: { type: string, coordinates: number[][] }; distance: string; duration: string } | { success: false; message: string }> {
    const response = await fetch(`${baseUrl}/corridas`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${await authenticate.getToken()}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ origem: origin, destinos: waypoints })
    })

    if(!response.ok) {
      alert(response.status)
      return { success: false, message: 'Não foi possível solicitar a corrida' }
    }

    const data = await response.json()
    const run = data.corrida

    return { success: true, cost: Number(run.valor), geometry: run.geometry, distance: run.distancia_km, duration: run.duracao_min }
  }

  async acceptRace() {
    const response = await { status: 'success', driverLocation: { latitude: -19.200520, longitude: -46.2355308 } }  // Envia localização do motorista
    return response
  }

  async cancelRace(tripId: string): Promise<Response> {
    const response = await fetch(`${baseUrl}/corridas/${tripId}/cancelled`, { 
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${await authenticate.getToken()}`,
        'Content-Type': 'application/json'
      },
    })

    const data = await { status: 'success' }
    return response
  }

  /**
   * Verifica se há uma corrida existente para o usuário, ativa, aceita ou pendente.
   * Retorna status da corrida e, se houver uma corrida recentemente ativa, informa dados do motorista
   * @returns Promise<{ status: string, state: TripState, racingData: Race | null }>
  */
  async checkExistingRace(): Promise<{ status: string, tripId: string | null, state: TripState, racingData: Race | null }> {
    // Simulação de resposta da API
    const response = await fetch(`${baseUrl}/corridas/active`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${await authenticate.getToken()}`,
        'Content-Type': 'application/json'
      }
    })

    return {
      status: 'success',
      tripId: '12345',
      state: 'match',
      racingData: {
        driver: {
          name: 'João Silva',
          rating: 4.8,
          location: {
            latitude: -19.200520,
            longitude: -46.2355308
          }
        },
        car: {
            make: 'Toyota',
            model: 'Corolla',
            licensePlate: 'ABC-1234',
            color: 'Prata'
        },
        rider: { name: 'Maria' },
        eta: 5
      },
    }
  }
}

