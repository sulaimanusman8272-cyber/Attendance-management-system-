import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, View } from 'react-native';
import { useAuth } from '../context/AuthContext';

import LoginScreen from '../screens/LoginScreen';
import HomeScreen from '../screens/HomeScreen';
import CoursesScreen from '../screens/CoursesScreen';
import ScanQRScreen from '../screens/ScanQRScreen';
import AttendanceScreen from '../screens/AttendanceScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function TabIcon({ label, focused }) {
  const map = { Home: '🏠', Courses: '📚', 'Scan QR': '📷', Attendance: '📊' };
  return (
    <View style={{ alignItems: 'center' }}>
      <Text style={{ fontSize: 22, opacity: focused ? 1 : 0.45 }}>{map[label]}</Text>
    </View>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused }) => <TabIcon label={route.name} focused={focused} />,
        tabBarActiveTintColor: '#009688',
        tabBarInactiveTintColor: '#90a4ae',
        tabBarStyle: {
          height: 65,
          paddingBottom: 10,
          paddingTop: 6,
          backgroundColor: '#fff',
          borderTopWidth: 1,
          borderTopColor: '#e0f2f1',
          shadowColor: '#000',
          shadowOpacity: 0.08,
          shadowRadius: 8,
          elevation: 8,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '700' },
        headerStyle: { backgroundColor: '#004d40' },
        headerTitleStyle: { color: '#fff', fontWeight: '800', fontSize: 18 },
        headerTintColor: '#fff',
        headerShadowVisible: false,
      })}
    >
      <Tab.Screen name="Home"       component={HomeScreen}       options={{ headerShown: false }} />
      <Tab.Screen name="Courses"    component={CoursesScreen}    options={{ headerShown: false }} />
      <Tab.Screen name="Scan QR"    component={ScanQRScreen}     options={{ headerShown: false }} />
      <Tab.Screen name="Attendance" component={AttendanceScreen} options={{ headerShown: false }} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { user, loading } = useAuth();
  if (loading) return null;

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user
          ? <Stack.Screen name="Main"  component={MainTabs} />
          : <Stack.Screen name="Login" component={LoginScreen} />
        }
      </Stack.Navigator>
    </NavigationContainer>
  );
}
