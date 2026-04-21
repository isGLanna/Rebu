import { View, StyleSheet } from 'react-native'
import { useState } from 'react'
import { Button, ThemedText, ThemedView, Input } from '@comp/index'
import { router } from 'expo-router'

export default function Login() {
  const [user, setUser] = useState<{email: string, password: string, type: string}>({email: '', password: '', type: 'passenger'})
  return (
    <ThemedView style={ styles.container }>
      
      <ThemedText>Email</ThemedText>
      <Input value={user.email} onChangeText={(text) => setUser(prev => ({...prev, email: text}))} />
      <ThemedText>Senha</ThemedText>
      <Input value={user.password} onChangeText={(text) => setUser(prev => ({...prev, password: text}))} />
      <ThemedText>Tipo de Usuário</ThemedText>
      <View>
        <Button onPress={() => setUser(prev => ({...prev, type: 'passenger'}))}>Passageiro</Button>
        <Button onPress={() => setUser(prev => ({...prev, type: 'driver'}))}>Motorista</Button>
      </View>
      <Button onPress={() => router.push('/explore')}>Enviar</Button>
    </ThemedView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  }
})