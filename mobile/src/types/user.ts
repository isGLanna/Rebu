export type User = {
  name: string
  email: string
  password: string
  type: 'driver' | 'passenger'
}

export type UserProfile = {
  name: string
  type: 'motorista' | 'passageiro'
  rating: number
  image: string
}