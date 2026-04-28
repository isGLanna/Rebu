import { View, StyleSheet, TouchableOpacity, Image } from 'react-native'
import { ThemedText } from '@comp/index'
import { Car } from '@/src/types/car'
import { Colors } from '@/src/styles/theme'

interface DriverCard {
  driverName: string,
  rating: number,
  car: Car,
  onPress: () => void
}

export function DriverCard({ driverName, rating, car, onPress }: DriverCard) {
  return (
      <TouchableOpacity onPress={onPress} style={styles.container}>
        <Image source={require('../assets/car.png')} style={styles.image}/>

        <View style={{ flex: 1}}>
          <View style={styles.header}>
            <ThemedText style={{ fontWeight: 'bold' }}>{driverName}</ThemedText>
            <ThemedText style={{ fontWeight: 'bold' }}>{rating}</ThemedText>
          </View>
          <View style={styles.content}>
            <View style={{ flexDirection: 'column' }}>
              <ThemedText>Modelo: {car.make} {car.model}</ThemedText>
              <ThemedText>Color: {car.color}</ThemedText>
            </View>
            <View style={{ justifyContent: 'flex-end'}}>
              <ThemedText>Placa: {car.licensePlate}</ThemedText>
            </View>
          </View>
        </View>
      </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.grey._500 + '60',
  },
  image: {
    width: 60,
    height: 60,
    borderRadius: 0,
    resizeMode: 'contain',
  },
  header: {
    flexDirection: 'row',
    alignContent: 'flex-start',
    justifyContent: 'space-between',
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignContent: 'flex-end',
  }
})