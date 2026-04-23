import { Tabs } from 'expo-router'
import React from 'react'
import { HapticTab } from '@/src/components/haptic-tab'
import { Colors } from '@/src/styles/theme'
import { useColorScheme,  } from '@hooks/use-color-scheme'
import { StyleSheet, View } from 'react-native'
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
        tabBarActiveBackgroundColor: colorScheme,
        }}>
        <Tabs.Screen
          name="index"
          options={{
            headerShown: false,
            title: 'Home',
            tabBarItemStyle: styles.tabBarItem,
          }}
          />
        <Tabs.Screen
          name="history"
          options={{ headerShown: false, title: 'History', tabBarItemStyle: styles.tabBarItem }}
          />
        <Tabs.Screen
          name="profile"
          options={{ headerShown: false, title: 'Profile', tabBarItemStyle: styles.tabBarItem }}
          />
      </Tabs>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  tabBar: {
    height: 50,
    width: '90%',     // Largura de 30% por rota
    margin: 'auto',
    marginBottom: 0,
    padding: 0,
    borderRadius: 50,
    boxShadow: `2px 2px 12px ${Colors.branding._500}60`,
    overflow: 'hidden',
  },
  tabBarItem: {
    width: 30,
    height: 50,
    borderRadius: 25,
  }
})