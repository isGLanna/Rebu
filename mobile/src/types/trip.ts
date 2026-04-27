export type RouteInfo = {
  geometry: any;
  distance: string;
  duration: string;
}

export type RequestRaceSuccess = {
  status: 'success'
  trip: {
    drivers: {
      driver: {
        name: string
        rating: number
      }
      car: {
        make: string
        model: string
        licensePlate: string
        color: string
      }
    }[]
  }
  cost: number
  geometry: any
  distance: string
  duration: string
}

export type RequestRaceError = {
  status: 'error'
}

export type RequestRaceResponse = RequestRaceSuccess | RequestRaceError