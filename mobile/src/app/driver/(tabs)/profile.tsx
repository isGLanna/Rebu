import { ThemedText, ThemedView, Button } from '@comp/index'
import { View, StyleSheet, TouchableOpacity, Image, Appearance } from 'react-native'
import IconFA from '@expo/vector-icons/FontAwesome'
import { UserProfile } from '@/src/types/user'
import { User } from '@/src/api/user'
import { useEffect, useState } from 'react'
import { Colors } from '@/src/styles/theme'
import { router } from 'expo-router'

export default function Profile() {
  const [ user, setUser ] = useState<UserProfile | null>(null)

  useEffect(() => {
    User.fetchUserProfile().then(profile => setUser(profile))
  })

  const handleLogout = () => {
    router.push('/')
    router.dismissAll()
  }

  const toggleTheme = () => {
    Appearance.setColorScheme(Appearance.getColorScheme() === 'light' ? 'dark' : 'light')
  }

  if (user === null) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText>Carregando perfil...</ThemedText>
      </ThemedView>
    )
  }

  return (
    <ThemedView style={styles.container}>
      <View style={[styles.header, styles.section]}>
        <TouchableOpacity activeOpacity={0.7}>
          <Image source={{ uri: 'https://us.123rf.com/450wm/anyaberkut/anyaberkut1603/anyaberkut160300954/59927355-happy-smiling-driver-in-the-car-portrait-of-young-successful-business-man.jpg'}} style={styles.avatar}/>
        </TouchableOpacity>
        <TouchableOpacity style={styles.presentation} activeOpacity={0.7}>
          <ThemedText type='defaultSemiBold'>{user.name}</ThemedText>
          <ThemedText>{user.type[0].toUpperCase() + user.type.slice(1)}</ThemedText>

          <View style={{ flexDirection: 'row'}}>
            <ThemedText>Avaliação: </ThemedText>
            <ThemedText>
              {user.rating} <IconFA name="star" size={16} color="gold" />
            </ThemedText>
          </View>

        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Button style={styles.button} onPress={() => {}}>Minhas viagens</Button>
        <Button style={styles.button} onPress={() => {}}>Pagamento</Button>
        <Button style={styles.button} onPress={() => {}}>Configurações</Button>
        <Button style={styles.button} onPress={toggleTheme}>Tema</Button>
        <Button style={styles.button} onPress={() => {}}>Suporte</Button>
      </View>

      <View style={[styles.section]}>
        <Button style={styles.button} onPress={handleLogout}>
          Sair
        </Button>
      </View>
    </ThemedView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    gap: 32,
  },
  section: {
    padding: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.branding._500,
  },
  header: {
    flexDirection: 'row',
    gap: 16,
  },
  avatar: {
    height: 80,
    aspectRatio: 1,
    borderRadius: 40,
  },
  presentation: {
    flexDirection: 'column',
    gap: 2,
    maxWidth: '60%',
  },
  button: {
    backgroundColor: 'transparent',
    borderBottomWidth: 0.5,
    height: 60,
    paddingHorizontal: 24,
    justifyContent: 'center',
    borderBottomColor: Colors.branding._500,
  }
})