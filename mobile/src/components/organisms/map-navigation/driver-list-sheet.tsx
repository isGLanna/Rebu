import { StyleSheet, View } from 'react-native'
import { BottomSheetModal, BottomSheetView,  } from '@gorhom/bottom-sheet'
import type { Driver } from '@/src/types/driver'
import { useRef, useEffect, useState } from 'react'
import { DriverCard } from '@molecules/driver-card'
import type { Car } from '@/src/types/vehicle'
import { useThemeColor } from '@hooks/use-theme-color'
import { Colors } from '@/src/styles/theme'
import { Button, ThemedText } from '@comp/index'
import { ModalScreen } from '../modal'

interface DriverListSheetProps {
  tripInfo: { driver: Driver | undefined, car: Car | undefined, cost: number, distance: string }
  onAccept: (driver: Driver, car: Car) => void
  onCancel: () => void
  onRequestNewDriver: () => void
}

/*  Painel Deslizante (BottomSheet)

O passageiro solicita uma corrida e, enquanto o sistema aguarda por motoristas aceitarem, um painel deslizante (BottomSheet) exibe informações que independem do motorista:
- Preço estimado da corrida
- Distância estimada
- Duração estimada
*/ 

export function DriverListSheet({ tripInfo, onAccept, onCancel, onRequestNewDriver }: DriverListSheetProps) {
  const modalRef = useRef<BottomSheetModal>(null)
  const backgroundColor = useThemeColor({}, 'background')
  const [ isModalOpen, setIsModalOpen ] = useState<boolean>(false)
  const wasAccepted = useRef<boolean>(false)

  const snapPoints = ['8%', '30%']

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

  const Loading = () => (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ThemedText>Procurando motoristas próximos...</ThemedText>
    </View>
  )

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
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <ThemedText style={styles.cost}>
                  Preço: R$ {tripInfo.cost.toFixed(2)}
                </ThemedText>
                <ThemedText>
                  {tripInfo.distance} km
                </ThemedText>
              </View>
              {tripInfo.driver && tripInfo.car ? (
                <DriverCard driverName={tripInfo.driver.name} rating={tripInfo.driver.rating} car={tripInfo.car} onPress={() => setIsModalOpen(prev => !prev)} />) : (
                <Loading />
              )}


              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 16 }}>
              </View>
            </View>
            <Button style={styles.button} onPress={onRequestNewDriver}>Solicitar novo motorista</Button>
          </BottomSheetView>
        </BottomSheetModal>

        {isModalOpen && tripInfo.driver && tripInfo.car && (
          <ModalScreen title="Deseja continuar com a corrida?">
            <View style={{ flexDirection: 'row', gap: 16 }}>
              <Button onPress={onCancel}>Cancelar</Button>
              <Button  onPress={() => {
                handleAccept(tripInfo.driver!, tripInfo.car!)
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