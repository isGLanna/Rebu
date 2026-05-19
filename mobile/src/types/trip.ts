export type RouteInfo = {
  geometry: any;
  distance: string;
  duration: string;
}

export type RequestRaceSuccess = {
  success: true
  trip: {
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
  }
  cost: number
  geometry: any
  distance: string
  duration: string,
  message?: string
}

export type RequestRaceError = {
  success: false
  message?: string
}

export type RequestRaceResponse = RequestRaceSuccess | RequestRaceError