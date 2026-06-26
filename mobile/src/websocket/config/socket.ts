import { io } from 'socket.io-client'
import { authenticate } from '@api/auth'
import { baseUrl } from '@config/base-url'

export const socket = io(baseUrl, {
    autoConnect: false,
    transports: ['websocket'],
    retries: 3,
    ackTimeout: 5000
  })

export const connectSocket = async () => {
  try {
    const token = await authenticate.getToken()
    if (!token)
      throw new Error('Token de autenticação não encontrado. O WebSocket não pode ser conectado.')

    socket.auth = { token }
    socket.connect()
  } catch (error) {
    console.error('Error:', error)
  }
}
