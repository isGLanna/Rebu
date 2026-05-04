import { UserProfile } from '@/src/types/user'

const header = {'Content-Type': 'application/json'}

export class User {
  static async fetchUserProfile(): Promise<UserProfile> {
    /*
    const response = await fetch('https://endereço/user/profile', {
    method: 'GET',
    headers: { header },
    })

    if (!response.ok) {
      throw new Error('Falha ao buscar perfil')}

    const data = await response.json()
    return data
    */
    return {
      name: 'Jorge dos Santos Pinheiro',
      type: 'motorista',
      rating: 4.5,
      image: 'https://us.123rf.com/450wm/anyaberkut/anyaberkut1603/anyaberkut160300954/59927355-happy-smiling-driver-in-the-car-portrait-of-young-successful' }
  }
}