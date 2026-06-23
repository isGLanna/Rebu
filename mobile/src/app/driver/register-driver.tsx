import { View, StyleSheet, useColorScheme } from 'react-native'
import { ThemedText, ThemedView, Button } from '@comp/index'
import { useThemeColor } from '../../hooks/use-theme-color'
import { useState } from 'react'
import { FloatingLabel } from '@molecules/floating-label'
import { Colors } from '../../styles/theme'
import { router } from 'expo-router'
import { useToast } from '@/src/context/toast-context'

export default function RegisterDriver () {
  const formColor = useThemeColor({}, 'container')
  const [user, setUser] = useState<{ name: string, email: string, password: string, confirmPassword: string, accountType: 'rider' | 'driver' | null}>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    accountType: null,
  })
  const { showToast } = useToast()

  const nextPage = async () => {
    if (!user.name || !user.email || !user.password || !user.confirmPassword) {
      showToast('Preencha todos os campos', 'error')
      return
    }
    if (user.password !== user.confirmPassword) {
      showToast('As senhas não coincidem', 'error')
      return
    }

    router.push({
      pathname: '/driver/register-vehicle',
      params: {
        name: user.name,
        email: user.email,
        password: user.password
      }
    })
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

        <Button onPress={nextPage} type='defaultSemiBold' style={{ alignSelf: 'flex-end' }}>
          Próximo
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