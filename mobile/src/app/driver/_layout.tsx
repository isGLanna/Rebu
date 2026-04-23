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
    <SafeAreaView style={{ flex: 1, backgroundColor: backgroundColor }}>
      <Tabs screenOptions={{
        tabBarStyle: styles.tabBar ,
        tabBarButton: HapticTab,
        tabBarItemStyle: styles.tabBarItem,
        tabBarActiveBackgroundColor: colorScheme,
        headerShown: false,
        }}>
        <Tabs.Screen name="index" options={{ title: 'Home', }} />
        <Tabs.Screen name="history" options={{ title: 'History', }} />
        <Tabs.Screen name="profile" options={{title: 'Profile', }} />
      </Tabs>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  tabBar: {
    height: 54,
    width: '90%',     // Largura de 30% por rota
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 50,
    boxShadow: `2px 2px 12px ${Colors.branding._500}60`,
    overflow: 'hidden',
  },
  tabBarItem: {
    top: 2,
    width: 70,
    maxWidth:90,
    height: 50,
    marginInline: 12,
    borderRadius: 50,
    overflow: 'hidden',
  }
})