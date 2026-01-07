import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Tabs } from 'expo-router';
import React, { ReactNode } from 'react';
import { GestureResponderEvent, Pressable, View } from 'react-native';

interface TabConfig {
  name: string;
  title: string;
  icon: string; // nome icona Ionicons
}

interface NavbarProps {
  tabs: TabConfig[];
}

interface CustomTabButtonProps {
  children: ReactNode;
  onPress?: (e: GestureResponderEvent) => void;
}

const CustomTabButton: React.FC<CustomTabButtonProps> = ({ children, onPress }) => {
  const handlePress = (e: GestureResponderEvent) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (onPress) {
      onPress(e);
    }
  };

  return (
    <Pressable
      className="flex-1 items-center justify-center py-2"
      onPress={handlePress}
    >
      {children}
    </Pressable>
  );
};

const CustomTabBarBackground = () => {
  // Sfondo bianco fisso con ombreggiatura top e bordi arrotondati come nell'immagine
  return (
    <View
      className="absolute inset-0 bg-white"
      style={{
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 8,
        borderTopLeftRadius: 0,
        borderTopRightRadius: 20,
      }}
    />
  );
};

export default function Navbar({ tabs }: NavbarProps) {

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#0D9488', // teal-600 per le icone attive
        tabBarInactiveTintColor: '#9CA3AF', // gray-400 per le icone inattive
        headerShown: false,
        // @ts-ignore
        tabBarButton: props => <CustomTabButton {...props} />,
        tabBarBackground: () => <CustomTabBarBackground />,
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: 0,
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.08,
          shadowRadius: 8,
          height: 80,
          paddingBottom: 20,
          paddingTop: 10,
          marginHorizontal: 0,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '500',
          marginTop: 4,
        },
        tabBarIconStyle: {
          marginBottom: 0,
        },
      }}
    >
      {tabs.map(tab => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          options={{
            title: tab.title,
            tabBarIcon: ({ color }) => (
              <Ionicons name={tab.icon as any} size={24} color={color} />
            ),
          }}
        />
      ))}
    </Tabs>
  );
} 