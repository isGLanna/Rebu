import { View, StyleSheet } from 'react-native'
import { useState } from 'react'
import { Button, ThemedText, ThemedView } from '@comp/index'
import { FloatingLabel } from '@molecules/animated-floating'
import { Colors } from '../styles/theme'
import { router } from 'expo-router'
import { useThemeColor } from '../hooks/use-theme-color'
import { useColorScheme } from '../hooks/use-color-scheme'

export default function Login() {
  const formColor = useThemeColor({}, 'container')
  const [user, setUser] = useState<{ name: string, email: string, password: string, confirmPassword: string, accountType: 'rider' | 'driver' | null}>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    accountType: null,
  })
  const buttonColor = useColorScheme() === 'light' ? Colors.branding._500 : Colors.branding._600

  return (
    <ThemedView style={ styles.container }>
      <View style={[ styles.form, { backgroundColor: formColor } ]}>
        <ThemedText style={{ marginBottom: 16 }} type='title'>Login</ThemedText>

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

        <Button
          onPress={() => {
            if (user.accountType === 'driver') {
              router.push('/driver')
              return
            }

            if (user.accountType === 'rider') {
              router.push('/rider')
            }
          }}
          type='defaultSemiBold'>
          Entrar
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
    boxShadow: `2px 2px 12px ${Colors.branding._500}60`
  },

  input: {
    width: '100%',
  },

  button: {
    fontSize: 16,
    fontWeight: 'medium',
  }
})