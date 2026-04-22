import { Tabs } from 'expo-router'
import React from 'react'
import { HapticTab } from '@/src/components/haptic-tab'
import { IconSymbol } from '@/src/components/ui/icon-symbol'
import { Colors } from '@/src/styles/theme'
import { useColorScheme } from '@hooks/use-color-scheme'
import { StyleSheet, View } from 'react-native'

export default function TabLayout() {
  const colorScheme = useColorScheme() === 'light' ? Colors.branding._400 + '80' : Colors.branding._600 + '80'

  return (
    <Tabs screenOptions={{
      tabBarActiveBackgroundColor: colorScheme,
      tabBarButton: HapticTab
    }}>
      <Tabs.Screen name="index" options={{ headerShown: false, title: 'Home' }} />
      <Tabs.Screen name="profile" options={{ headerShown: false, title: 'Profile'}}/>
    </Tabs>
  )
}