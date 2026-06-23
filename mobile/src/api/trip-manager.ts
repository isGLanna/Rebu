import type { Race, RequestRaceResponse, RouteInfo } from '@/src/types/trip'
import { authenticate } from './auth'
import { TripState } from '../websocket/use-trip-events';

const baseUrl = process.env.EXPO_BASE_URL || 'http://192.168.3.82:3001'
const header = {'Content-Type': 'application/json'}

export class TripManager {

  private async getHeaders() {
    const token = await authenticate.getToken()
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  }
  // enviar requisição com token de validação
  async requestRace(origin: { latitude: number, longitude: number }, waypoints: { latitude: number, longitude: number }[]): Promise<| { success: true; tripId: string; cost: number; geometry: { type: string, coordinates: number[][] }; distance: string; duration: string } | { success: false; message: string }> {
    const user = await authenticate.getUser()

    if (!user) {
      return { success: false, message: 'Usuário não autenticado' }
    }

    try {
      const response = await fetch(`${baseUrl}/corridas/${user.id}/solicitar`, {
        method: 'POST',
        headers: await this.getHeaders(),
        body: JSON.stringify({
          origem_lat: origin.latitude, 
          origem_lng: origin.longitude,
          destino_lat: waypoints[0].latitude,
          destino_lng: waypoints[0].longitude
        })
      })

      if(!response.ok) {
        return { success: false, message: 'Não foi possível solicitar a corrida' }
      }

      const data = await response.json()
      const run = data.corrida

      alert(JSON.stringify(run))

      return { success: true, tripId: run.id, cost: Number(run.valor), geometry: run.geometry, distance: run.distancia_km, duration: run.duracao_min }
    } catch (err: unknown) {
      return { success: false, message: (err as Error).message || 'Ocorreu um erro ao solicitar a corrida' }
    }
  }

  async acceptRace(tripId: string): Promise<{ success: boolean; message?: string }> {
    /* Atualmente a corrida é atribuida automaticamente ao motorista
    const response = await fetch(`${baseUrl}/corridas/${tripId}/accept`, {
      method: 'POST',
      headers: await this.getHeaders()
    })

    if (!response.ok) return { success: false, message: 'Corrida indisponível ou erro no servidor' }*/
    return { success: true }
  }

  async getTripDetails(tripId: string): Promise<{ success: boolean; data?: any; message?: string }> {
    try {
      const response = await fetch(`${baseUrl}/corridas/${tripId}`, {
        method: 'GET',
        headers: await this.getHeaders()
      })

      if (!response.ok) throw new Error('Falha ao buscar detalhes da corrida')
      
      const data = await response.json()
      return { success: true, data }
    } catch (err: any) {
      return { success: false, message: err.message }
    }
  }

  async arriveAtLocation(tripId: string): Promise<{ success: boolean; message?: string }> {
    const response = await fetch(`${baseUrl}/corridas/${tripId}/arrive`, {
      method: 'POST',
      headers: await this.getHeaders()
    })

    if (!response.ok) return { success: false, message: 'Não foi possível notificar chegada' }
    return { success: true }
  }

  async startTrip(tripId: string): Promise<{ success: boolean; message?: string }> {
    const response = await fetch(`${baseUrl}/corridas/${tripId}/start`, {
      method: 'POST',
      headers: await this.getHeaders()
    })

    if (!response.ok) return { success: false, message: 'Não foi possível iniciar a corrida' }
    return { success: true }
  }

  async finishTrip(tripId: string): Promise<{ success: boolean; message?: string }> {
    const response = await fetch(`${baseUrl}/corridas/${tripId}/finish`, {
      method: 'POST',
      headers: await this.getHeaders()
    })

    if (!response.ok) return { success: false, message: 'Não foi possível finalizar a corrida' }
    return { success: true }
  }

  async cancelRace(tripId: string): Promise<Response> {
    const response = await fetch(`${baseUrl}/corridas/${tripId}/cancelled`, { 
      method: 'POST',
      headers: await this.getHeaders(),
    })

    const data = await { status: 'success' }
    return response
  }

  /**
   * Verifica se há uma corrida existente para o usuário, ativa, aceita ou pendente.
   * Retorna status da corrida e, se houver uma corrida recentemente ativa, informa dados do motorista
   * @returns Promise<{ status: string, state: TripState, racingData: Race | null }>
  */
  async existingRunCheck(): Promise<{ status: string, tripId: string | null, state: TripState, racingData: Race | null }> {
    // Simulação de resposta da API
    const response = await fetch(`${baseUrl}/corridas/active`, {
      method: 'GET',
      headers: await this.getHeaders(),
    })
    return { status: 'success', tripId: null, state: 'idle', racingData: null }

    /*return {
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
    }*/
  }
}

