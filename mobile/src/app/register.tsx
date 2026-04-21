import { View, StyleSheet } from 'react-native'
import { ThemedText, ThemedView, Input, Button } from '@comp/index'
import { useThemeColor } from '../hooks/use-theme-color'
import { useEffect, useState} from 'react'
import { FloatingLabel } from '@molecules/animated-floating'
import { Colors } from '../styles/theme'
import { router } from 'expo-router'

export default function Register () {
  const formColor = useThemeColor({}, 'container')
  const [user, setUser] = useState<{ name: string, email: string, password: string, confirmPassword: string, accountType: 'passenger' | 'driver' | null}>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    accountType: null,
  })

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
              style={ user.accountType === 'passenger' ? { backgroundColor: Colors.branding._600, boxShadow: `2px 2px 8px ${Colors.branding._500}80`, elevation: 4 } : {}}
              onPress={() => setUser(prev => ({...prev, accountType: 'passenger'}))}
              type='normal'>
                Passageiro
              </Button>
            <Button
              style={ user.accountType === 'driver' ? { backgroundColor: Colors.branding._600, boxShadow: `2px 2px 8px ${Colors.branding._500}80`, elevation: 4  } : {}}
              onPress={() => setUser(prev => ({...prev, accountType: 'driver'}))}
              type='normal'>
                Motorista
              </Button>
          </View>
        </View>

        <Button onPress={() => router.push('/')} type='subtitle'>
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