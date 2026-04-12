import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { View, Text } from 'react-native';
import CameraScreen from './src/screens/CameraScreen';
import HistoryScreen from './src/screens/HistoryScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import { Colors } from './src/constants/theme';
import type { RootTabParamList } from './src/constants/theme';

const Tab = createBottomTabNavigator<RootTabParamList>();

// Simple icon labels (no external icon library)
function TabIcon({ focused, label }: { focused: boolean; label: string }) {
  const icons: Record<string, string> = {
    Camera: '📷',
    History: '📋',
    Settings: '⚙️',
  };
  return (
    <View style={{ alignItems: 'center' }}>
      <Text style={{ fontSize: 20 }}>{icons[label] ?? '•'}</Text>
      <Text
        style={{
          fontSize: 11,
          color: focused ? Colors.accent : Colors.textSecondary,
          marginTop: 2,
        }}
      >
        {label}
      </Text>
    </View>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="light" />
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: true,
          headerStyle: {
            backgroundColor: Colors.surface,
          },
          headerTintColor: Colors.textPrimary,
          headerTitleStyle: {
            fontWeight: 'bold',
            fontSize: 18,
          },
          tabBarStyle: {
            backgroundColor: Colors.surface,
            borderTopColor: Colors.border,
            borderTopWidth: 1,
            height: 60,
            paddingBottom: 8,
            paddingTop: 8,
          },
          tabBarShowLabel: false,
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} label={route.name} />
          ),
          sceneStyle: {
            backgroundColor: Colors.background,
          },
        })}
      >
        <Tab.Screen
          name="Camera"
          component={CameraScreen}
          options={{ headerTitle: 'Rebar Counter' }}
        />
        <Tab.Screen
          name="History"
          component={HistoryScreen}
          options={{ headerTitle: 'History' }}
        />
        <Tab.Screen
          name="Settings"
          component={SettingsScreen}
          options={{ headerTitle: 'Settings' }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
