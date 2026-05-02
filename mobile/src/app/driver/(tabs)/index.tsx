import { ThemedView, ThemedText } from '@comp/index'
import { StyleSheet, View, TouchableOpacity, Image, ScrollView } from 'react-native'
import { MapView } from '@organisms/index'
import { useState, useEffect } from 'react'
import foodIcon from '@comp/assets/food-icon.png'
import packageIcon from '@comp/assets/package-icon.png'
import carIcon from '@comp/assets/car-icon.png'
import thief from '@comp/assets/thief.png'
import * as Location from 'expo-location'
import { useThemeColor } from '@/src/hooks/use-theme-color'

export default function Home() {
  const [ location, setLocation ] = useState<Location.LocationObject | null>(null)
  const [ errorMsg, setErrorMsg ] = useState<string | null>(null)
  const borderColor = useThemeColor({}, 'border')
  const backgroundColor = useThemeColor({}, 'background')

  useEffect(() => {
    async function getLocation() {
      let { status } = await Location.requestForegroundPermissionsAsync()
      if (status !== 'granted') {
        setErrorMsg('Permissão de localização negada')
        return
      }

      let location = await Location.getCurrentPositionAsync({})
      setLocation(location)
    }

    getLocation()
  }, [])

  return (
    <ScrollView style={{backgroundColor}}>
      <ThemedView style={styles.container}>
        <ThemedText type='subtitle'>Procurar por corridas</ThemedText>
        <MapView location={location?.coords} errorMsg={errorMsg} />
        
        <ThemedText type='subtitle'>Serviços</ThemedText>

        <View style={styles.content}>
          <TouchableOpacity style={[ styles.categoriesCard, { borderColor }]} activeOpacity={0.6}>
            <Image source={carIcon} style={styles.icon} resizeMode='contain'/>
            <ThemedText type='defaultSemiBold'>Corrida</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity style={[ styles.categoriesCard, { borderColor }]} activeOpacity={0.6}>
            <Image source={foodIcon} style={styles.icon} resizeMode='contain'/>
            <ThemedText type='defaultSemiBold'>Delivery</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity style={[ styles.categoriesCard, { borderColor }]} activeOpacity={0.6}>
            <Image source={packageIcon} style={styles.icon} resizeMode='contain'/>
            <ThemedText type='defaultSemiBold'>Encomendas</ThemedText>
          </TouchableOpacity>
        </View>

        <ThemedText type='subtitle'>Instruções</ThemedText>
        <View style={ styles.content}>
          <TouchableOpacity style={[ styles.card, { borderColor }]} activeOpacity={0.6}>
            <Image source={thief} style={styles.icon} resizeMode='contain'/>
            <ThemedText>
            {'  '} Comportamentos suspeitos e fora do comum devem ficar sob alerta. Siga as diretrizes da plataforma para se manter seguro!
            </ThemedText>
          </TouchableOpacity>
          <TouchableOpacity style={[ styles.card, { borderColor }]} activeOpacity={0.6}>
            <Image source={thief} style={styles.icon} resizeMode='contain'/>
            <ThemedText>
            {'  '} Comportamentos suspeitos e fora do comum devem ficar sob alerta. Siga as diretrizes da plataforma para se manter seguro!
            </ThemedText>
          </TouchableOpacity>
        </View>

      </ThemedView>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    gap: 16,
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
    borderRadius: 16,
    borderWidth: 1,
  },
  card: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: '47%',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 4,
    borderRadius: 16,
    borderWidth: 1,
  },
  icon: {
    width: 60,
    height: 50,
  },
})