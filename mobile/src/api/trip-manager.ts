import type { RequestRaceResponse, RouteInfo } from '@/src/types/trip'
import { Car } from '../types/car'
import { Driver } from '../types/rider'

export class TripManager {
  static async requestRace(origin: { latitude: number, longitude: number }, waypoints: { latitude: number, longitude: number }[]): Promise<RequestRaceResponse> {
    //const response = await fetch("nosso-backend.com/")
    const data = await this.fetchDirections(origin, waypoints)
      if (!data)
        return { status: 'error' }
      
    const response: RequestRaceResponse = { status: 'success', trip: { drivers: [{ driver: { name: 'Joao', rating: 4.8 }, car: { make: 'Fiat', model: 'Mobi', licensePlate: 'ABC1D23', color: 'Prata' } }]}, cost: data.cost, geometry: data.geometry, distance: data.distance, duration: data.duration }
    return response
  }

  static async acceptRace() {
    const response = await { status: 'success', driverLocation: { latitude: -19.200520, longitude: -46.2355308 } }  // Envia localização do motorista
    return response
  }

  static async cancelRace() {
    const response = await { status: 'success' }
    return response
  }

/* TODO: Implementar lógica de rotas no backend e consumir aqui */
  static async fetchDirections(origin: { latitude: number, longitude: number }, waypoints: { latitude: number, longitude: number }[],) {
    const originString = `${origin.longitude},${origin.latitude}`
    const destinationString = waypoints.map(m => `${m.longitude},${m.latitude}`).join(';')
    const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${originString};${destinationString}?geometries=geojson&access_token=${process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN}`

    try{
      const response = await fetch(url)
      const data = await response.json()

      if (data.code !== 'Ok' && data.routes.length === 0)
        return null

      const route = data.routes[0]

      const distance = route.distance > 1000 ?
        route.distance / 1000 + ' km'
        : route.distance + ' m'

      const duration = Math.round(route.duration / 60) + ' min'

      const cost = this.calculatePrice(route.distance, route.duration)

      return ({
        geometry: route.geometry,
        distance,
        duration,
        cost
      })
    } catch (error) {
      alert('Não foi possível calcular a rota')
    }
  }

  static async driverPosition() {
    const response = await { latitude: -19.200520, longitude: -46.2355308 }
    return response
  }

  // Simulador de preço
  static calculatePrice(distance: number, duration: number): number {
    const base = 2.50
    const costPerKm = 1.0
    const costPerMin = 0.8

    const distanceCost = (distance / 1000) * costPerKm
    const durationCost = (duration / 60) * costPerMin

    return (base + distanceCost + durationCost)
  }

  static async checkExistingRace(): Promise<{ status: string, trip: { driver: Driver; car: Car, cost: number } | null }> {
    // Simulação de verificação de corrida existente
    const response = await { status: 'success', trip: null }
    return response
  }
}

