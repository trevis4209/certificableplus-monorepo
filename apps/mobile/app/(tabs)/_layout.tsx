import * as Haptics from 'expo-haptics';
import React, { ReactNode } from 'react';
import { GestureResponderEvent, Pressable, View } from 'react-native';

import Navbar from '@/components/layout/Navbar';
import { useColorScheme } from '@/hooks/useColorScheme';

interface CustomTabButtonProps {
  children: ReactNode;
  onPress?: (e: GestureResponderEvent) => void;
}

// Componente personalizzato per il pulsante della tab bar con feedback aptico
const CustomTabButton: React.FC<CustomTabButtonProps> = ({ children, onPress }) => {
  const handlePress = (e: GestureResponderEvent) => {
    // Fornisce feedback aptico quando si preme il pulsante
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // Chiamare onPress solo se è definito
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

// Componente personalizzato per lo sfondo della tab bar
const CustomTabBarBackground = () => {
  const colorScheme = useColorScheme();
  const bgColor = colorScheme === 'dark' ? 'bg-gray-900/80' : 'bg-white/80';
  
  return <View className={`absolute inset-0 ${bgColor} backdrop-blur-md`} />;
};

const tabs = [
  { name: 'index', title: 'Home', icon: 'home' },
  { name: 'products', title: 'Prodotti', icon: 'cube' },
  { name: 'maintenance', title: 'Interventi', icon: 'build' },
  { name: 'map', title: 'Maps', icon: 'map' },
  { name: 'profile', title: 'Profile', icon: 'person' },
];

export default function TabLayout() {
  return <Navbar tabs={tabs} />;
}
