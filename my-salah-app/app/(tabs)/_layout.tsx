import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';

import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
  initialRouteName="index"
  screenOptions={{
    tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
    headerShown: false,
    tabBarShowLabel: false,
    tabBarButton: HapticTab,
    tabBarBackground: TabBarBackground,
    tabBarStyle: {
      backgroundColor: '#111',
      borderTopColor: '#222',
      ...Platform.select({
        ios: {
          position: 'absolute',
        },
        default: {},
      }),
    },
  }}
>

  <Tabs.Screen
    name="Stats"
    options={{
      tabBarIcon: ({ color }) => <IconSymbol size={28} name="chart.bar.fill" color={color} />,
    }}
  />
    <Tabs.Screen
    name="index"
    options={{
      tabBarIcon: ({ color }) => <IconSymbol size={32} name="house.fill" color={color} />,
    }}
  />
  <Tabs.Screen
    name="settings"
    options={{
      tabBarIcon: ({ color }) => <IconSymbol size={28} name="gearshape.fill" color={color} />,
    }}
  />
</Tabs>
  );
}