import { StyleSheet } from 'react-native'
import { BottomSheetModal, BottomSheetView,  } from '@gorhom/bottom-sheet'
import type { Driver } from '@comp/../types/rider'
import { useRef, useEffect } from 'react'
import { DriverCard } from '@molecules/driver-card'
import type { Car } from '@/src/types/car'
import { useThemeColor } from '@hooks/use-theme-color'
import { Colors } from '@/src/styles/theme'
import { ThemedText } from '@comp/index'

interface DriverListSheetProps {
  driver: Omit<Driver, 'location'>,
  car: Car
  cost: number
}

export function DriverListSheet({ driver, car, cost }: DriverListSheetProps) {
  const modalRef = useRef<BottomSheetModal>(null)
  const backgroundColor = useThemeColor({}, 'background')

  const snapPoints = ['20%', '50%']

  useEffect(() => {
    modalRef.current?.present()
  }, [])

  return (
    <BottomSheetModal
      ref={modalRef}
      snapPoints={snapPoints}
      backgroundStyle={{ backgroundColor }}
      handleIndicatorStyle={{ backgroundColor: Colors.grey._500 + '80' }}
      enablePanDownToClose={false}
      >
      <BottomSheetView  style={styles.header}>
        <ThemedText style={styles.cost}>Preço estimado: R$ {cost.toFixed(2)}</ThemedText>
        <DriverCard driverName={driver.name} rating={driver.rating} car={car} onPress={() => {}} />
      </BottomSheetView>
    </BottomSheetModal>
  )
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  cost: {
    fontSize: 16,
    fontWeight: 'bold',
  },
})