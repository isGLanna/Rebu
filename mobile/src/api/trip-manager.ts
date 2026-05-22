import type { RequestRaceResponse, RouteInfo } from '@/src/types/trip'
import { Car } from '../types/car'
import { Driver } from '../types/rider'
import { authenticate } from './auth'

const baseUrl = process.env.EXPO_BASE_URL || 'http://192.168.3.82:3001'

export class TripManager {
  // enviar requisição com token de validação
  async requestRace(origin: { latitude: number, longitude: number }, waypoints: { latitude: number, longitude: number }[]): Promise<| { success: true; cost: number; geometry: { type: string, coordinates: number[][] }; distance: string; duration: string } | { success: false; message: string }> {
    const token = await authenticate.getToken()

    const response = await fetch(`${baseUrl}/corridas`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
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

  async cancelRace() {
    const response = await { status: 'success' }
    return response
  }

  async driverPosition() {
    const response = await { latitude: -19.200520, longitude: -46.2355308 }
    return response
  }

  /**
   * Verifica se há uma corrida existente para o usuário, ativa, aceita ou pendente.
   * Retorna status da corrida e, se houver uma corrida recentemente ativa, informa dados do motorista
   * @returns Promise<{ status: string, driverData: {driver: Driver; car: Car} | null }>
  */
  async checkExistingRace(): Promise<{ status: string, driverData: {driver: Driver; car: Car} | null }> {
    // Simulação de verificação de corrida existente
    const response = await { status: 'success', driverData: null }
    return response
  }
}

