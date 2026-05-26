import { View, StyleSheet, useColorScheme } from 'react-native'
import { ThemedText, ThemedView, Button } from '@comp/index'
import { useThemeColor } from '../hooks/use-theme-color'
import { useState } from 'react'
import { FloatingLabel } from '@molecules/animated-floating'
import { authenticate } from '@api/auth'
import { Colors } from '../styles/theme'
import { router } from 'expo-router'

export default function Register () {
  const formColor = useThemeColor({}, 'container')
  const [user, setUser] = useState<{ name: string, email: string, password: string, confirmPassword: string, accountType: 'rider' | 'driver' | null}>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    accountType: null,
  })
  const buttonColor = useColorScheme() === 'light' ? Colors.branding._500 : Colors.branding._600

  const handleSubmit = async () => {
    const result = await authenticate.registerUser({
      name: user.name,
      email: user.email,
      password: user.password,
      type: user.accountType === 'rider' ? 'rider' : 'driver'
    })

    if (result?.status === 'success') {
      router.push('/')
    } else {
      alert(result?.message || 'Erro ao criar usuário')
    }
  }

  return (
    <ThemedView style={ styles.container }>
      <View style={[ styles.form, { backgroundColor: formColor } ]}>
        <ThemedText style={{ marginBottom: 16 }} type='title'>Cadastro</ThemedText>

        <FloatingLabel
          label='Nome'
          focused={false}
          value={user.name}
          onChangeText={(text) => setUser(prev => ({ ...prev, name: text}))}
        />

        <FloatingLabel
          label='Email'
          focused={false}
          value={user.email}
          onChangeText={(text) => setUser(prev => ({ ...prev, email: text}))}
        />

        <FloatingLabel
          label='Senha'
          focused={false}
          value={user.password}
          onChangeText={(text) => setUser(prev => ({ ...prev, password: text}))}
        />

        <FloatingLabel
          label='Confirmar senha'
          focused={false}
          value={user.confirmPassword}
          onChangeText={(text) => setUser(prev => ({ ...prev, confirmPassword: text}))}
        />

        <View style={{ width: '100%', gap: 8, marginBottom: 8 }}>
          <ThemedText style={{ paddingHorizontal: 8 }}>Tipo de conta</ThemedText>
          <View style={{ flexDirection: 'row', gap: 32, justifyContent: 'center', alignItems: 'center' }}>
            <Button
              style={ user.accountType === 'rider' ? { backgroundColor: buttonColor, boxShadow: `2px 2px 8px ${Colors.branding._500}80`, elevation: 4 } : {}}
              onPress={() => setUser(prev => ({...prev, accountType: 'rider'}))}
              type='normal'>
                Passageiro
              </Button>
            <Button
              style={ user.accountType === 'driver' ? { backgroundColor: buttonColor, boxShadow: `2px 2px 8px ${Colors.branding._500}80`, elevation: 4  } : {}}
              onPress={() => setUser(prev => ({...prev, accountType: 'driver'}))}
              type='normal'>
                Motorista
              </Button>
          </View>
        </View>

        <Button onPress={handleSubmit} type='defaultSemiBold'>
          Criar conta
        </Button>
      </View>
    </ThemedView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  form: {
    width: '100%',
    gap: 24,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 32,
    borderRadius: 8,
    boxShadow: `2px 2px 12px ${Colors.branding._500}60`,
  },

  input: {
    width: '100%',
  },

  button: {
    fontSize: 16,
    fontWeight: 'medium',
  }
})