import { StyleSheet, View, ActivityIndicator } from 'react-native'
import { BottomSheetModal, BottomSheetView,  } from '@gorhom/bottom-sheet'
import type { Driver } from '@/src/types/driver'
import { useRef, useEffect, useState, useCallback, useMemo } from 'react'
import { DriverCard } from '@molecules/driver-card'
import type { Car } from '@/src/types/vehicle'
import { useThemeColor } from '@hooks/use-theme-color'
import { Colors } from '@/src/styles/theme'
import { Button, ThemedText } from '@comp/index'
import { ModalScreen } from '../modal'

interface DriverListSheetProps {
  tripInfo: { driver: Driver | undefined, car: Car | undefined, cost: number, distance: string, duration: string  }
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
// Função para lidar com o texto do tempo de chegada (minutos, horas, minuto, hora)
const formattedEtaTime = (textTime: string) => {
  const numericTime = Number(textTime)
  const time = Math.trunc(numericTime)  // Converte para valores de segundos entre 0 e 60
  const hours = Math.floor(time / 60)
  const minutes = time - 60 * hours

  if (hours >= 1) 
    return hours + 'h ' + minutes + 'min'
  else  if (minutes >  1)
    return minutes + ' minutos'
  else
    return minutes + ' minuto'
}

const formattedTimer = (timer: number): string => {
  const minutes = Math.floor(timer / 60)
  const seconds = timer - 60 * minutes

  return minutes.toString() + ':' + seconds.toString().padStart(2, '0')
}

const Loading = ({ timer }: {timer: number}) => (
  <View style={styles.loadingContainer}>
    <ThemedText>Procurando motoristas próximos...</ThemedText>
    <ThemedText type='subtitle'>{formattedTimer(timer)}</ThemedText>
    <ActivityIndicator color='#fff' size={32} />

  </View>
)

export function DriverListSheet({ tripInfo, onAccept, onCancel, onRequestNewDriver }: DriverListSheetProps) {
  const modalRef = useRef<BottomSheetModal>(null)
  const backgroundColor = useThemeColor({}, 'background')
  const [ isModalOpen, setIsModalOpen ] = useState<boolean>(false)
  const wasAccepted = useRef<boolean>(false)
  const etaText: string = formattedEtaTime(tripInfo.duration)
  const [timer, setTimer] = useState(0)

  const snapPoints = ['8%', '35%']

  useEffect(() => {
    modalRef.current?.present()
  }, [])

  const handleAccept = useCallback((driver: Driver, car: Car) => {
    wasAccepted.current = true
    onAccept(driver, car)
    modalRef.current?.close()
  }, [wasAccepted])

  // Garante que onCancel seja chamado somente se o modal fechar sem aceitar corrida (onCancel limpa estado de searchRace e COORDENADAS DE ROTA)
  const handleOnDismiss = useCallback(() => {
    if (!wasAccepted.current) {
      onCancel()
    }
  }, [wasAccepted])

  useEffect(() => {
    if(tripInfo.driver) return

    const interval = setInterval(() => {
      setTimer(prev => prev + 1)
    }, 1000)

    return () => clearInterval(interval)
  }, [tripInfo.driver])


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
              <View style={ styles.content }>
                <ThemedText style={styles.cost}>
                  Preço: R${tripInfo.cost.toFixed(2)}
                </ThemedText>
                <View style={{ flexDirection: 'column', alignItems:'flex-end', gap: 8 }}>
                  <ThemedText>Chegará em {etaText}</ThemedText>
                  <ThemedText>{tripInfo.distance} km</ThemedText>
                </View>
              </View>

              {tripInfo.driver && tripInfo.car ? (
                <DriverCard driverName={tripInfo.driver.name} rating={tripInfo.driver.rating} car={tripInfo.car} onPress={() => setIsModalOpen(prev => !prev)} />) : 
                (<Loading timer={timer}/>)}
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 16 }}>
              </View>
            </View>
            {tripInfo.driver && tripInfo.car ? (
              <Button style={styles.button} onPress={onRequestNewDriver}>Solicitar novo motorista</Button>
            ) : null}
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
  content: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    paddingVertical: 2,
    borderBottomWidth: 0.5,
    borderColor: Colors.grey._700,
  },
  cost: {
    fontWeight: 'bold',
  },
  button: {
    alignItems: 'center',
  },

  loadingContainer: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    paddingVertical: 18
  }
})