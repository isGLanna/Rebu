import { View, StyleSheet, useColorScheme } from 'react-native'
import { ThemedText, ThemedView, Button } from '@comp/index'
import { useThemeColor } from '../../hooks/use-theme-color'
import { useState } from 'react'
import { FloatingLabel } from '@molecules/floating-label'
import { authenticate } from '@api/auth'
import { Colors } from '../../styles/theme'
import { router, useLocalSearchParams } from 'expo-router'
import { Car } from '@/src/types'

export default function RegisterVehicle () {
  const params = useLocalSearchParams()
  const formColor = useThemeColor({}, 'container')
  const [vehicle, setVehicle] = useState<Car>({
    make: '',
    model: '',
    licensePlate: '',
    color: '',
  })

  // TODO: Implementar recebimento de dados do veículo
  const handleSubmit = async () => {
    if(!vehicle.make || !vehicle.model || !vehicle.licensePlate || !vehicle.color) {
      alert('Preencha todos os campos do veículo')
      return
    }

    const result = await authenticate.registerUser({
      name: params.name as string,
      email: params.email as string,
      password: params.password as string,
      type: 'driver'
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
          label='Marca'
          focused={false}
          value={vehicle.make}
          onChangeText={(text) => setVehicle(prev => ({ ...prev, make: text }))}
        />

        <FloatingLabel
          label='Modelo'
          focused={false}
          value={vehicle.model}
          onChangeText={(text) => setVehicle(prev => ({ ...prev, model: text }))}
        />

        <FloatingLabel
          label='Placa'
          focused={false}
          value={vehicle.licensePlate}
          onChangeText={(text) => setVehicle(prev => ({ ...prev, licensePlate: text }))}
        />

        <FloatingLabel
          label='Cor'
          focused={false}
          value={vehicle.color}
          onChangeText={(text) => setVehicle(prev => ({ ...prev, color: text }))}
        />

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