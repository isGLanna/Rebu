import { Tabs } from 'expo-router'
import React from 'react'
import { HapticTab } from '@/src/components/haptic-tab'
import { Colors } from '@/src/styles/theme'
import { useColorScheme,  } from '@hooks/use-color-scheme'
import { StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useThemeColor } from '@/src/hooks/use-theme-color'

export default function TabLayout() {
  const colorScheme = useColorScheme() === 'light' ? Colors.branding._400 + '60' : Colors.branding._600 + '60'
  const backgroundColor = useThemeColor({}, 'background')

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: backgroundColor  }}>
      <Tabs screenOptions={{
        tabBarActiveBackgroundColor: colorScheme,
        tabBarButton: HapticTab
        }}>
        <Tabs.Screen name="index" options={{ headerShown: false, title: 'Home' }} />
        <Tabs.Screen name="profile" options={{ headerShown: false, title: 'Profile'}}/>
      </Tabs>
    </SafeAreaView>
  )
}