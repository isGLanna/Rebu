import { StyleSheet, View, ActivityIndicator } from 'react-native'
import { BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet'
import type { Driver } from '@/src/types/driver'
import { useRef, useEffect, useState, useCallback, useMemo } from 'react'
import { DriverCard } from '@molecules/driver-card'
import type { Car } from '@/src/types/vehicle'
import { useThemeColor } from '@hooks/use-theme-color'
import { Colors } from '@/src/styles/theme'
import { Button, ThemedText } from '@comp/index'
import { useRaceTimer } from '@hooks/use-race-timer'
import { ModalScreen } from '../modal'

interface DriverListSheetProps {
  tripInfo: { driver?: Driver | undefined, car?: Car | undefined, cost: number, distance: string, duration: string  }
  isFinished: boolean
  onCancel: () => Promise<boolean>
  onRequestNewDriver: () => void
  onFinish: () => void
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

export function DriverListSheet({ tripInfo, isFinished, onCancel, onRequestNewDriver, onFinish }: DriverListSheetProps) {
  const modalRef = useRef<BottomSheetModal>(null)
  const backgroundColor = useThemeColor({}, 'background')
  const etaText: string = formattedEtaTime(tripInfo.duration)
  const { timer } = useRaceTimer()

  const snapPoints = ['11%', '35%']

  useEffect(() => {
    modalRef.current?.present()
  }, [])

  // Garante que onCancel seja chamado somente se o modal fechar sem aceitar corrida (onCancel limpa estado de searchRace e COORDENADAS DE ROTA)
  const handleOnDismiss = useCallback(async () => {
    if (!isFinished) {
      await onCancel()
    }
  }, [isFinished, onCancel])

  return (
      <>
        <BottomSheetModal
          ref={modalRef}
          index={1}
          snapPoints={snapPoints}
          backgroundStyle={{ backgroundColor }}
          handleIndicatorStyle={{ backgroundColor: Colors.gray._500 + '80' }}
          enablePanDownToClose={isFinished}
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
                <DriverCard driverName={tripInfo.driver.name} rating={tripInfo.driver.rating} car={tripInfo.car} onPress={() => {}} />) :
                (<Loading timer={timer}/>)}
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 16 }}>
              </View>
            </View>
          </BottomSheetView>
        </BottomSheetModal>

        {isFinished && (
          <ModalScreen title="Corrida encerrada">
            <View style={styles.finishedContainer}>
              <ThemedText type="subtitle">Obrigado por usar o Rebu!</ThemedText>
              <ThemedText>Valor cobrado: R${tripInfo.cost.toFixed(2)}</ThemedText>
              <Button onPress={onFinish}>Voltar ao início</Button>
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
    borderColor: Colors.gray._700,
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
  },
  finishedContainer: {
    alignItems: 'center',
    gap: 16,
    paddingVertical: 8,
  }
})