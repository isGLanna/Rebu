import AsyncStorage from '@react-native-async-storage/async-storage'
import { User } from '../types/user'
import { router } from 'expo-router'

const header = 'Content-Type: application/json'
const baseUrl = 'http://localhost:3000/auth'

const authorize = {
  async signInPassenger (user: Omit<User, 'name' | 'type'>) {
    try {
      const token = await fetch(`${baseUrl}/signin/passenger`, {
        method: 'POST',
        headers: {header},
        body: JSON.stringify(user)
      })

    } catch (err) {
      console.error('Error signing in', err)
    }
  },

  async signInDriver (user: Omit<User, 'name' | 'type'>) {
    try {
      const token = await fetch(`${baseUrl}/signin/driver`, {
        method: 'POST',
        headers: {header},
        body: JSON.stringify(user)
      })

    } catch (err) {
      console.error('Error signing in', err)
    }
  },

  async registerPassenger (user: User) {
    try {
      await fetch(`${baseUrl}/register/passenger`, {
        method: 'POST',
        headers: {header},
        body: JSON.stringify(user)
      })
      
    } catch (err) {
      console.error('Error registering passenger', err)
    }
  },

  async registerDriver (user: User) {
    try {
      await fetch(`${baseUrl}/register/driver`, {
        method: 'POST',
        headers: {header},
        body: JSON.stringify(user)
      })
      
    } catch (err) {
      console.error('Error registering driver', err)
    }
  },

  async signOut () {
    try {
      await AsyncStorage.removeItem('authToken')
      
      router.dismissAll()
      router.replace('/')
    } catch (err) {
      console.error('Error signing out', err)
    }
  },

  async setToken (value: string) {
    try {
      await AsyncStorage.setItem('authToken', value)
    } catch (err) {
      console.error('Error storing data', err)
    }
  },

  async getToken () {
    try {
      const token = await AsyncStorage.getItem('authToken')
      return token
    } catch (err) {
      console.error('Error retrieving data', err)
    }
  }
}