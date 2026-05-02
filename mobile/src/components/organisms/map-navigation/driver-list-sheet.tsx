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
  tripInfo: { driver: Driver, car: Car, cost: number }
  onAccept: (driver: Driver, car: Car) => void
  onCancel: () => void
  onRequestNewDriver: () => void
}

export function DriverListSheet({ tripInfo, onAccept, onCancel, onRequestNewDriver }: DriverListSheetProps) {
  const modalRef = useRef<BottomSheetModal>(null)
  const backgroundColor = useThemeColor({}, 'background')
  const [ isModalOpen, setIsModalOpen ] = useState<boolean>(false)
  const wasAccepted = useRef<boolean>(false)

  const snapPoints = ['8%', '20%']

  useEffect(() => {
    modalRef.current?.present()
  }, [])

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
      <>
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
            <View>
              <ThemedText style={styles.cost}>Preço estimado: R$ {tripInfo.cost.toFixed(2)}</ThemedText>
              <DriverCard driverName={tripInfo.driver.name} rating={tripInfo.driver.rating} car={tripInfo.car} onPress={() => setIsModalOpen(prev => !prev)} />
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 16 }}>
              </View>
            </View>
            <Button style={styles.button} onPress={onRequestNewDriver}>Solicitar novo motorista</Button>
          </BottomSheetView>
        </BottomSheetModal>

        {isModalOpen && (
          <ModalScreen title="Deseja continuar com a corrida?">
            <View style={{ flexDirection: 'row', gap: 16 }}>
              <Button onPress={onCancel}>Cancelar</Button>
              <Button  onPress={() => {
                handleAccept(tripInfo.driver, tripInfo.car)
                setIsModalOpen(prev => !prev)
                }}>
                Confirmar
              </Button>
            </View>

          </ModalScreen>
        )}
      </>
  )
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  cost: {
    fontWeight: 'bold',
  },
  button: {
    alignItems: 'center',
  }
})