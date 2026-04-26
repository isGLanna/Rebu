export class TripManager {
  static async requestRace() {
    //const response = await fetch("nosso-backend.com/")
    const response = await { status: 'success', car: { model: 'Fiat Mobi', plate: 'ABC1D23' }, driver: { name: 'João Silva', rating: 4.8, location: { latitude: -23.550520, longitude: -46.633308 } },  }
    return response
  }

  static async acceptRace() {
    const response = await { status: 'success' }
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

      if (data.code === 'Ok' && data.routes.length > 0) {
        const route = data.routes[0]

        const distance = route.distance > 1000 ?
          route.distance / 1000 + ' km'
          : route.distance + ' m'

        const duration = Math.round(route.duration / 60) + ' min'

        return ({
          geometry: route.geometry,
          distance,
          duration,
        })
      }
    } catch (error) {
      alert('Não foi possível calcular a rota')
    }
  }

  static async driverPosition() {
    const response = await { latitude: -23.550520, longitude: -46.633308 }
    return response
  }
}

