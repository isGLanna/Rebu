import { BottomSheetModalProvider } from '@gorhom/bottom-sheet'
import { Stack } from 'expo-router'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { connectSocket, socket } from '@websocket/config/socket'
import { useEffect } from 'react'

const anchor = '(tabs)'

export default function Layout() {
  
  useEffect(() => {
    connectSocket()

    socket.on('connect', () => console.log('WebSocket conectado com sucesso!', socket.id))
    socket.on('connect_error', (error) => console.error('Erro ao conectar o WebSocket:', error))

    return () => { socket.disconnect() }
  }, [])
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <BottomSheetModalProvider>
        <Stack initialRouteName={anchor}>
          <Stack.Screen name={anchor} options={{ headerShown: false }} />
          <Stack.Screen name="navigation-map" options={{ headerShown: false }} />
          <Stack.Screen name="index" options={{ headerShown: false }}/>
          <Stack.Screen name="login" options={{ headerShown: false }}/>
          <Stack.Screen name="register-driver" options={{ headerShown: false }}/>
          <Stack.Screen name="register-vehicle" options={{ headerShown: false }} />

        </Stack>
      </BottomSheetModalProvider>
    </GestureHandlerRootView>
  )
}