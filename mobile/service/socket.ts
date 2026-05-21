import { io } from 'socket.io-client'

const baseUrl = process.env.EXPO_BASE_URL || ''

export const socket = io(baseUrl, {
    autoConnect: true,
    transports: ['websocket'],
  })
