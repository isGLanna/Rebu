import AsyncStorage from '@react-native-async-storage/async-storage'
import { User } from '../types/user'
import { router } from 'expo-router'

const header = { "Content-Type": "application/json" }
const baseUrl = 'http://192.168.3.82:3001'

export const authenticate = {
  async signInPassenger (user: Omit<User, 'name' | 'type'>) {
    try {
      const response = await fetch(`${baseUrl}/signin/passenger`, {
        method: 'POST',
        headers: header,
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
        headers: header,
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

  async registerUser (user: User): Promise<{ status: 'success' | 'error', message: string } | undefined> {
    try {
      const response = await fetch(`${baseUrl}/usuarios`, {
        method: 'POST',
        headers: header,
        body: JSON.stringify({nome: user.name, email: user.email, senha: user.password, tipo: user.type})
      })

      if (!response.ok) {
        return { status: 'error', message: 'Erro ao criar usuário' }
      }

      return { status: 'success', message: 'Usuário criado com sucesso' }
      // Enviar toast de sucesso
    } catch (err) {
      return { status: 'error', message: 'Erro ao criar usuário' }
      // Enviar toast de falha
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