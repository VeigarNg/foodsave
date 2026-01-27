// tabs/_layout.tsx
import React from 'react'
import { Tabs } from 'expo-router'
import { View, ActivityIndicator } from 'react-native'
import { HapticTab } from '@/components/haptic-tab'
import { IconSymbol } from '@/components/ui/icon-symbol'
import { Colors } from '@/constants/theme'
import { useColorScheme } from '@/hooks/use-color-scheme'
import { useSession } from '@/lib/useSession'
import { router } from 'expo-router'

export default function TabLayout() {
  const colorScheme = useColorScheme()
  const { user, loading } = useSession(false) // don't redirect automatically

  // Redirect unauthenticated users
  React.useEffect(() => {
    if (!loading && !user) {
      router.replace('/login')
    }
  }, [loading, user])

  // Show loading spinner while fetching session
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={Colors[colorScheme ?? 'light'].tint} />
      </View>
    )
  }

  // User is authenticated → render tabs
  if (!user) return null // redirect will happen in useEffect

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="org"
        options={{
          title: 'Organiser Dashboard',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="person.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="gearshape.fill" color={color} />,
        }}
      />
    </Tabs>
  )
}
