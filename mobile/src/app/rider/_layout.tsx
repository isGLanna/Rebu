import { Stack } from 'expo-router'

const anchor = '(tabs)'

export default function Layout() {
  return (
    <Stack initialRouteName={anchor}>
      <Stack.Screen name={anchor} options={{ headerShown: false }} />
      <Stack.Screen name="navigation-map" options={{ headerShown: false }} />
    </Stack>
  )
}