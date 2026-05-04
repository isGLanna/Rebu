import { Tabs } from 'expo-router'
import React from 'react'
import { Colors } from '@/src/styles/theme'
import { useColorScheme,  } from '@hooks/use-color-scheme'
import { StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useThemeColor } from '@/src/hooks/use-theme-color'
import IconFA from '@expo/vector-icons/FontAwesome6'
import IconO from '@expo/vector-icons/Octicons'
import IconL from '@expo/vector-icons/Fontisto'

export default function TabLayout() {
  const colorScheme = useColorScheme() === 'light' ? Colors.branding._400 + '60' : Colors.branding._600 + '60'
  const backgroundColor = useThemeColor({}, 'background')

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: backgroundColor }}>
      <Tabs screenOptions={{
        tabBarStyle: styles.tabBar ,
        tabBarItemStyle: styles.tabBarItem,
        tabBarActiveBackgroundColor: colorScheme,
        tabBarActiveTintColor: Colors.branding._500,
        tabBarInactiveTintColor: Colors.branding._500,
        headerShown: false,
        }}>
        <Tabs.Screen name="index" options={{
          title: 'Home', tabBarIcon: ({focused}) =>
          <IconO name={focused ? 'home-fill' : 'home'} color={Colors.branding._500} size={24} /> }} />
        <Tabs.Screen name="history" options={{
          title: 'History',tabBarIcon: () =>
          <IconL name='clock' color={Colors.branding._500} size={24}/> }} />
        <Tabs.Screen name="profile" options={{
          title: 'Profile', tabBarIcon: () =>
          <IconFA name='user' color={Colors.branding._500} size={24} /> }} />
      </Tabs>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    height: 54,
    width: '90%',     // Largura de 30% por rota
    marginHorizontal: '5%', // Centraliza a tab bar
    alignItems: 'center',
    borderRadius: 50,
    boxShadow: `2px 2px 12px ${Colors.branding._500}80`,
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