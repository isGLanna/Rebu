import { View, StyleSheet } from 'react-native'
import { ThemedView, TextButton } from '@comp/index'
import { TextSkeleton } from '@skeleton/text-skeleton'
import { ImageSkeleton } from '@skeleton/image-skeleton'
import { Colors } from '@/src/styles/theme'

export const Loading = () => {
  return (
    <ThemedView style={styles.container}>
      <View style={[styles.header, styles.section]}>
        <View style={styles.avatar}>
          <ImageSkeleton />
        </View>
        <View style={styles.presentation}>
          <TextSkeleton style={{ width: '80%' }} />
          <TextSkeleton />
          <TextSkeleton />
        </View>
      </View>

      <View style={styles.section}>
        <TextButton style={styles.button} onPress={() => {}}>Minhas viagens</TextButton>
        <TextButton style={styles.button} onPress={() => {}}>Pagamento</TextButton>
        <TextButton style={styles.button} onPress={() => {}}>Configurações</TextButton>
        <TextButton style={styles.button} onPress={() => {}}>Tema</TextButton>
        <TextButton style={styles.button} onPress={() => {}}>Suporte</TextButton>
      </View>

      <View style={[styles.section]}>
        <TextButton style={styles.button} onPress={() => {}}>
          Sair
        </TextButton>
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
    overflow: 'hidden',
  },
  presentation: {
    flex: 1,
    gap: 2,
    flexDirection: 'column',
    justifyContent: 'center',
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