import { StyleSheet, View, ActivityIndicator } from 'react-native'
import { BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet'
import { useRef, useEffect, useMemo, useState, useCallback } from 'react'
import { useThemeColor } from '@hooks/use-theme-color'
import { Colors } from '@/src/styles/theme'
import { Button, ThemedText } from '@comp/index'
import { TripManager } from '@/src/api/trip-manager'
import { useToast } from '@/src/context/toast-context'
import { useRacingStore } from '@/src/context/racing-state'

interface Rider {
  name: string
  // rating: number
}

interface RiderListSheetProps {
  tripInfo: {
    rider?: Rider | undefined
    cost?: number
    distance?: string
    duration?: string
  }
  isLoading: boolean
  onArrive: () => void
  onStart: () => void
  onFinish: () => void
}

const formattedEtaTime = (textTime?: string) => {
  if (!textTime) return ''
  const numericTime = Number(textTime)
  const time = Math.trunc(numericTime)
  const hours = Math.floor(time / 60)
  const minutes = time - 60 * hours

  if (hours >= 1) 
    return hours + 'h ' + minutes + 'min'
  else if (minutes > 1)
    return minutes + ' minutos'
  else
    return minutes + ' minuto'
}

export function RiderListSheet({tripInfo, isLoading, onArrive ,onStart, onFinish }: RiderListSheetProps) {
  const [ searchingRace, setSearchingRace ] = useState(false)
  const modalRef = useRef<BottomSheetModal>(null)
  const backgroundColor = useThemeColor({}, 'background')
  const etaText = formattedEtaTime(tripInfo.duration)
  const snapPoints = ['16%', '35%']
  const tripManager = useMemo(() => new TripManager(), [])
  const { tripState } = useRacingStore()
  const { showToast } = useToast()

  useEffect(() => {
    modalRef.current?.present()
  }, [tripState])

  const toggleDriverStatus = useCallback(async () => {
    setSearchingRace(true)
    try {
      const result = await tripManager.toggleDriverStatus(true)

      if (!result.success)
        throw new Error(result.message || 'Não foi possível ficar disponível para viagens')
    
      showToast('Você está disponível para corridas', 'success')

    } catch(err: unknown) {
      setSearchingRace(false)
      showToast((err as Error).message || 'Não foi possível ficar disponível para viagens', 'error')
    }
  }, [tripManager, showToast])

  return (
    <BottomSheetModal
      ref={modalRef}
      index={0}
      snapPoints={snapPoints}
      backgroundStyle={{ backgroundColor }}
      handleIndicatorStyle={{ backgroundColor: Colors.gray._500 + '80' }}
      enablePanDownToClose={false}
    >
      <BottomSheetView style={styles.container}>
        
        <View style={{ alignItems: 'center' }}>
          {tripState === 'idle' && !searchingRace && <ThemedText type="subtitle">Disponível para viagens</ThemedText>}
          {tripState === 'idle' && searchingRace && <ThemedText type="subtitle">Aguardando corridas...</ThemedText>}
          {tripState === 'match' && <ThemedText type="subtitle">Buscar passageiro</ThemedText>}
          {tripState === 'confirm' && <ThemedText type="subtitle">Aguardando passageiro no local</ThemedText>}
          {tripState === 'in_transit' && <ThemedText type="subtitle">A caminho do destino</ThemedText>}
        </View>

        {tripState !== 'idle' && (
          <View style={styles.tripContent}>
            {tripInfo.cost !== undefined && (
              <ThemedText>
                Ganho: R${tripInfo.cost.toFixed(2)}
              </ThemedText>
            )}
            <View style={{ flexDirection: 'column', alignItems: 'flex-end', gap: 2 }}>
              {tripInfo.duration && <ThemedText>Tempo total: {etaText}</ThemedText>}
              {tripInfo.distance && <ThemedText>{tripInfo.distance} km</ThemedText>}
            </View>
          </View>
        )}

        {tripState !== 'idle' && tripInfo.rider && (
          <View style={styles.contentCard}>
            <ThemedText>Passageiro</ThemedText>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
              <ThemedText type='defaultSemiBold'>{tripInfo.rider.name}</ThemedText>
              {/* TODO: implementar método de avaliação de motorista */}
              <ThemedText>⭐ {4.5}</ThemedText>
            </View>
          </View>
        )}

        {tripState === 'idle' && !searchingRace && (
          <Button onPress={toggleDriverStatus} style={[styles.button]}>
            Buscar Corrida
          </Button>
        )}

        {tripState === 'idle' && searchingRace && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator color={Colors.branding._500} size="small" />
            <ThemedText style={styles.searchingText}>Procurando passageiros próximos...</ThemedText>
          </View> 
        )}

        <View style={styles.actionContainer}>

          {tripState === 'match' && (
            <Button onPress={onArrive} style={[styles.button]}>
              {isLoading ? 'Processando...' : 'Cheguei ao Local'}
            </Button>
          )}

          {tripState === 'confirm' && (
            <Button onPress={onStart} style={[styles.button ]}>
              {isLoading ? 'Processando...' : 'Iniciar Viagem'}
            </Button>
          )}

          {tripState === 'in_transit' && (
            <Button onPress={onFinish} style={[styles.button, { backgroundColor: Colors.red._500 }]}>
              {isLoading ? 'Processando...' : 'Finalizar Corrida'}
            </Button>
          )}
        </View>

      </BottomSheetView>
    </BottomSheetModal>
  )
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  tripContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: 0.5,
    borderColor: Colors.gray._700,
  },
  contentCard: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'flex-start',
    padding: 8,
    borderRadius: 8,
    borderWidth: 0.5,
    borderColor: Colors.gray._700,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    gap: 10,
  },
  searchingText: {
    color: Colors.gray._500,
    fontSize: 14,
  },
  actionContainer: {
    marginTop: 4,
  },
  button: {
    alignItems: 'center',
    width: '100%',
  },
})