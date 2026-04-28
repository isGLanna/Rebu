import { StyleSheet, View } from 'react-native'
import { BottomSheetModal, BottomSheetView,  } from '@gorhom/bottom-sheet'
import type { Driver } from '@comp/../types/rider'
import { useRef, useEffect, useState } from 'react'
import { DriverCard } from '@molecules/driver-card'
import type { Car } from '@/src/types/car'
import { useThemeColor } from '@hooks/use-theme-color'
import { Colors } from '@/src/styles/theme'
import { Button, ThemedText } from '@comp/index'
import { ModalScreen } from '../modal'

interface DriverListSheetProps {
  tripInfo: { drivers: { driver: Driver; car: Car}[], cost: number }
  onAccept: (driver: Driver, car: Car) => void
  onCancel: () => void
}

export function DriverListSheet({ tripInfo, onAccept, onCancel }: DriverListSheetProps) {
  const modalRef = useRef<BottomSheetModal>(null)
  const backgroundColor = useThemeColor({}, 'background')
  const [ isModalOpen, setIsModalOpen ] = useState<boolean>(false)
  const wasAccepted = useRef<boolean>(false)

  const snapPoints = ['10%', '20%', '50%']

  useEffect(() => {
    modalRef.current?.present()
  }, [])

  const openModal = () => {
    setIsModalOpen(true)
  }

  const handleAccept = (driver: Driver, car: Car) => {
    wasAccepted.current = true
    onAccept(driver, car)
    modalRef.current?.close()
  }

  // Garante que onCancel seja chamado somente se o modal fechar sem aceitar corrida (onCancel limpa estado de searchRace e COORDENADAS DE ROTA)
  const handleOnDismiss = () => {
    if (!wasAccepted.current) {
      onCancel()
    }
  }

  return (
      <BottomSheetModal
        ref={modalRef}
        index={1}
        snapPoints={snapPoints}
        backgroundStyle={{ backgroundColor }}
        handleIndicatorStyle={{ backgroundColor: Colors.grey._500 + '80' }}
        enablePanDownToClose={true}
        onDismiss={handleOnDismiss}
        >
        <BottomSheetView  style={styles.header}>

          {tripInfo.drivers.map((driverInfo, index) => {
              const { driver, car } = driverInfo
              return (
                <View key={index}>
                  <ThemedText style={styles.cost}>Preço estimado: R$ {tripInfo.cost.toFixed(2)}</ThemedText>
                  <DriverCard driverName={driver.name} rating={driver.rating} car={car} onPress={() => {handleAccept(driver, car)}} />
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 16 }}>
                  </View>
                </View>
              )
            })}
          <Button style={styles.button} onPress={onCancel}>Cancelar</Button>

        </BottomSheetView>
      </BottomSheetModal>
  )
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  cost: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  button: {
    alignItems: 'center',
  }
})