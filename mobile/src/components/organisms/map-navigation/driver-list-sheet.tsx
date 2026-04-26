import { ThemedText, ThemedView } from '@comp/index'
import { TouchableOpacity, View, StyleSheet } from 'react-native'
import type { Driver } from '@comp/../types/rider'
import { Colors } from '@/src/styles/theme'

interface DriverListSheetProps {
  driver: Omit<Driver, 'location'>,
}

export function DriverListSheet({ driver }: DriverListSheetProps) {
  return (
    <ThemedView>
      <View style={styles.header}>
        <ThemedText>Motoristas disponíveis</ThemedText>
      </View>

      <TouchableOpacity style={styles.driverItem} activeOpacity={0.6}>
        <ThemedText>{driver.name}</ThemedText>
        <ThemedText>Rating: {driver.rating}</ThemedText>
      </TouchableOpacity>
      
    </ThemedView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.grey._500,
  },
  driverItem: {
    width: '100%',
    height: 60,
    flexDirection: 'row',
  }
})