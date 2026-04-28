import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native'
import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { useFonts } from 'expo-font'
import 'react-native-reanimated'

import { useColorScheme } from '@/src/hooks/use-color-scheme';
export const unstable_settings = {
  anchor: 'index',
};

export default function RootLayout() {
  const colorScheme = useColorScheme()
  const [fontsLoaded] = useFonts({
    'Orbitron-Regular': require('@/src/assets/font/Orbitron/Orbitron-Regular.ttf'),
    'Orbitron-Medium': require('@/src/assets/font/Orbitron/Orbitron-Medium.ttf'),
    'Orbitron-SemiBold': require('@/src/assets/font/Orbitron/Orbitron-SemiBold.ttf'),
    'Orbitron-Bold': require('@/src/assets/font/Orbitron/Orbitron-Bold.ttf'),
    'Orbitron-ExtraBold': require('@/src/assets/font/Orbitron/Orbitron-ExtraBold.ttf'),
    'Orbitron-Black': require('@/src/assets/font/Orbitron/Orbitron-Black.ttf'),
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack initialRouteName='index'>
        <Stack.Screen name="index" options={{ headerShown: false }}/>
        <Stack.Screen name="login" options={{ headerShown: false }}/>
        <Stack.Screen name="register" options={{ headerShown: false }}/>
        <Stack.Screen name="driver" options={{ headerShown: false }}/>
        <Stack.Screen name="rider" options={{ headerShown: false }}/>
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  )
}
