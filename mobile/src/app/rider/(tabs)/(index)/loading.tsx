import { ThemedView } from '@comp/index'
import { StyleSheet, View } from 'react-native'
import { TextSkeleton } from '@skeleton/text-skeleton'
import { ImageSkeleton } from '@skeleton/image-skeleton'

export const Loading = () => {
  return (
    <ThemedView style={{ flex: 1 }}>
      <View style={ styles.container }>
        <ImageSkeleton style={{ maxHeight: 120, borderRadius: 16 }} />
        <ImageSkeleton style={{ maxHeight: 120, borderRadius: 16 }} />
      </View>
    </ThemedView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    gap: 16,
    overflow: 'hidden',
  },
  span: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  content: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  categoriesCard: {
    flex: 1,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 2,
    borderRadius: 16,
    borderWidth: 1,
  },
  card: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: '47%',
    maxHeight: 200,
    alignItems: 'center',
    gap: 4,
    padding: 4,
    borderRadius: 16,
    borderWidth: 1,
    textOverflow: 'ellipsis',
  },
  icon: {
    width: '100%',
    height: 50,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    borderBottomRightRadius: 0,
    borderBottomLeftRadius: 0,
    overflow: 'hidden',
  },
})