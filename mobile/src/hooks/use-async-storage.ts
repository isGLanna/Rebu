import AsyncStorage from "@react-native-async-storage/async-storage"
import { useState, useEffect, useCallback } from "react"
import { useFocusEffect } from "@react-navigation/native"

/*
  Para revisão posterior, este hook é uma contribuição de zwilderrr diponível no link abaixo:
  - url: https://github.com/react-native-async-storage/async-storage/issues/32

  Obs: O hook pode apresentar problemas caso seja utilizado em múltiplos componentes, pois o valor atualizado só é buscado quando o componente é focado ou quando o estado 'updated' é alterado.
  Portanto, recomenda-se prevenir o uso deste hook em componentes frequentemente montados ou utilizar um gerenciador de estados global como useContext ou Zustand para compartilhar o estado.
*/
export function useAsyncStorage<T>(key: string, defaultValue: T): [T, (nextValue: T) => Promise<void>] {
  const [value, setValue] = useState<T>(defaultValue)
  const [updated, setUpdated] = useState(false)

  useFocusEffect(
    useCallback(() => {
      getStorageValue()
    }, [])
  )

  useEffect(() => {
    getStorageValue()
  }, [updated])

  async function getStorageValue() {
    let nextValue = defaultValue

    const fromStorage = await AsyncStorage.getItem(key)
    if(fromStorage) {
      nextValue = JSON.parse(fromStorage)
    }
    setValue(nextValue)
    setUpdated(false)
  }

  async function setStorageValue(nextValue: T) {
    await AsyncStorage.setItem(key, JSON.stringify(nextValue))
    setValue(nextValue)
    setUpdated(true)
  }

  return [value, setStorageValue]
}