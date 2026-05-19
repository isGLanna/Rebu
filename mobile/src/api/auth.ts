import AsyncStorage from '@react-native-async-storage/async-storage'
import { User } from '../types/user'
import { router } from 'expo-router'

const header = { "Content-Type": "application/json" }
const baseUrl = process.env.EXPO_BASE_URL || 'http://192.168.3.82:3001'

export const authenticate = {
  async signIn (user: Omit<User, 'name'>): Promise<{ success: boolean, message?: string }> {
      const response = await fetch(`${baseUrl}/login`, {
        method: 'POST',
        headers: header,
        body: JSON.stringify({email: user.email, senha: user.password, tipo: user.type})
      })

    const data = await response.json()

    if (!response.ok || !data.token) {
      return { success: false, message: data.message || 'Erro ao autenticar usuário' }
    }

    await this.setToken(data.token)
    await this.setUser({ id: data.userId, name: data.name, email: user.email, type: user.type })
    return { success: true }
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

  // armazena id e outros dados do usuário conforme necessário
  async setUser (user: { id: string, name: string, email: string, type: 'driver' | 'rider' }) {
    try {
      await AsyncStorage.setItem('user', JSON.stringify(user))
    }catch (err) {
      return null
    }
  },

  async getUser (): Promise<{ id: string, name: string, email: string, type: 'driver' | 'rider' } | null> {
    try {
      const userData = await AsyncStorage.getItem('user')
      return userData ? JSON.parse(userData) : null
    } catch(err) {
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
}