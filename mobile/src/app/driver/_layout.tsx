import { BottomSheetModalProvider } from '@gorhom/bottom-sheet'
import { Stack } from 'expo-router'
import { GestureHandlerRootView } from 'react-native-gesture-handler'

const anchor = '(tabs)'

export default function Layout() {
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