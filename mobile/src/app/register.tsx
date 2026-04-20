import { View, Text, StyleSheet } from 'react-native'
import { ThemedText, ThemedView, Input, Button } from '@comp/index'
import { useThemeColor } from '../hooks/use-theme-color'
import { useState } from 'react'

export default function Register () {
  const formColor = useThemeColor({}, 'container')
  const [selectedField, setSelectedField] = useState<string | null>(null)

  return (
    <ThemedView style={ styles.container }>
      <View style={[ styles.form, { backgroundColor: formColor } ]}>
        <ThemedText style={{ marginBottom: 16 }} type='title'>Cadastro</ThemedText>
        <View style={ styles.field }>
          <ThemedText style={[ styles.label, { backgroundColor: formColor }, selectedField === 'name' && styles.onFocus ]}>Nome</ThemedText>
          <Input onFocus={() => setSelectedField('name')}/>
        </View>
        <View style={ styles.field }>
          <ThemedText style={[ styles.label, { backgroundColor: formColor }, selectedField === 'email' && styles.onFocus ]}>Email</ThemedText>
          <Input onFocus={() => setSelectedField('email')}/>
        </View>
        <View style={ styles.field }>
          <ThemedText style={[ styles.label, { backgroundColor: formColor }, selectedField === 'password' && styles.onFocus ]}>Senha</ThemedText>
          <Input onFocus={() => setSelectedField('password')}/>
        </View>
        <View style={ styles.field }>
          <ThemedText style={[ styles.label, { backgroundColor: formColor }, selectedField === 'confirmPassword' && styles.onFocus ]}>Confirmar senha</ThemedText>
          <Input onFocus={() => setSelectedField('confirmPassword')}/>
        </View>
        <View style={[ styles.field, { gap: 8 } ]}>
          <ThemedText style={{ paddingHorizontal: 8 }} >Tipo de conta</ThemedText>
          <View style={{ flexDirection: 'row', gap: 32, justifyContent: 'center', alignItems: 'center' }}>
            <Button onPress={() => alert('passageiro')} type='normal'>Passageiro</Button>
            <Button onPress={() => alert('motorista')} type='normal'>Motorista</Button>
          </View>
        </View>

        <Button onPress={() => alert('enviar')} type='subtitle'>
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
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 32,
    borderRadius: 8,
    gap: 24,
  },

  field: {
    width: '100%',
  },

  label: {
    position: 'absolute',
    paddingHorizontal: 4,
    justifyContent: 'center',
    top: 12,
    left: 12,
    zIndex: 2,
  },
  onFocus:{
    transform: [{ translateY: -16 - 12 }, { translateX: -4 }],  // font-size - paddingVertical
  },

  input: {
    width: '100%',
  },

  button: {
    fontSize: 16,
    fontWeight: 'medium',
  }
})