import { io } from 'socket.io-client'
import { authenticate } from '@api/auth'

const baseUrl = process.env.EXPO_BASE_URL || ''

export const socket = io(baseUrl, {
    autoConnect: true,
    transports: ['websocket'],
    retries: 3,
    ackTimeout: 5000
  })

export const connectSocket = () => {
  try {
    const token = authenticate.getToken()
    if (!token)
      throw new Error('Token de autenticação não encontrado. O WebSocket não pode ser conectado.')

    socket.auth = { token }
    socket.connect()
  } catch (error) {
    console.error('Error:', error)
  }
}
