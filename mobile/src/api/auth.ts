import AsyncStorage from '@react-native-async-storage/async-storage'
import { User } from '../types/user'
import { router } from 'expo-router'

const header = 'Content-Type: application/json'
const baseUrl = 'http://localhost:3000/auth'

export const authorize = {
  async signInPassenger (user: Omit<User, 'name' | 'type'>) {
    try {
      const response = await fetch(`${baseUrl}/signin/passenger`, {
        method: 'POST',
        headers: {header},
        body: JSON.stringify(user)
      })

      const data = await response.json()

      if (!response.ok || !data.token) {
        return
      }

      await AsyncStorage.setItem('authToken', data.token)
    } catch (err) {
      console.error('Error signing in', err)
    }
  },

  async signInDriver (user: Omit<User, 'name' | 'type'>) {
    try {
      const response = await fetch(`${baseUrl}/signin/driver`, {
        method: 'POST',
        headers: {header},
        body: JSON.stringify(user)
      })

      const data = await response.json()

      if (!response.ok || !data.token) {
        return
      }

      await AsyncStorage.setItem('authToken', data.token)
    } catch (err) {
      return
    }
  },

  async registerPassenger (user: User) {
    try {
      const response = await fetch(`${baseUrl}/register/passenger`, {
        method: 'POST',
        headers: {header},
        body: JSON.stringify(user)
      })

      if (!response.ok) {
        return
      }

      // Enviar toast de sucesso
    } catch (err) {
      return // Enviar toast de falha
    }
  },

  async registerDriver (user: User) {
    try {
      const response = await fetch(`${baseUrl}/register/driver`, {
        method: 'POST',
        headers: {header},
        body: JSON.stringify(user)
      })

      if (!response.ok) {
        return
      }
      
      // Enviar toast de sucesso
    } catch (err) {
      return // Enviar toast de falha
    }
  },

  async signOut () {
    try {
      await AsyncStorage.removeItem('authToken')

      router.dismissAll()
      router.replace('/')
    } catch (err) {
      return null
    }
  },

  async setToken (value: string) {
    try {
      await AsyncStorage.setItem('authToken', value)
    } catch (err) {
      return null
    }
  },

  async getToken () {
    try {
      const token = await AsyncStorage.getItem('authToken')
      return token
    } catch (err) {
      return null
    }
  },

  async isAuthtenticated(): Promise<string | null> {
    try {
      const response = await fetch(`${baseUrl}/validate`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${await this.getToken()}` }
      })

      const data = await response.json()

      if (!response.ok || !data.token) {
        await AsyncStorage.removeItem('authToken')
        return null
      }
      
      await AsyncStorage.setItem('authToken', data.token)

      return data.role
    } catch (err) {
      return null
    }
  }
}