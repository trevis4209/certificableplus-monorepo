import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

interface HeaderProps {
  title: string;
  subtitle?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  showNotification?: boolean;
  onNotificationPress?: () => void;
  backgroundColor?: string;
  showBackButton?: boolean;
  onBackPress?: () => void;
  /**
   * Custom right action component (overrides showNotification if provided)
   */
  rightAction?: React.ReactNode;
}

export default function Header({
  title,
  subtitle,
  icon,
  showNotification = false,
  onNotificationPress,
  backgroundColor = 'bg-teal-600',
  showBackButton = false,
  onBackPress,
  rightAction
}: HeaderProps) {
  return (
    <View className={`${backgroundColor} pt-12 pb-4 px-4`}>
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center flex-1">
          {showBackButton ? (
            <TouchableOpacity 
              className="mr-3 p-2 -ml-2"
              onPress={onBackPress}
            >
              <Ionicons name="arrow-back" size={28} color="white" />
            </TouchableOpacity>
          ) : (
            icon && (
              <View className="mr-3">
                <Ionicons name={icon} size={32} color="white" />
              </View>
            )
          )}
          <View className="flex-1">
            <Text className="text-white text-2xl font-bold">{title}</Text>
            {subtitle && (
              <Text className="text-teal-100 text-base">{subtitle}</Text>
            )}
          </View>
        </View>
        
        {rightAction ? (
          rightAction
        ) : showNotification ? (
          <TouchableOpacity
            className="bg-white/20 p-3 rounded-full"
            onPress={onNotificationPress}
          >
            <Ionicons name="notifications" size={24} color="white" />
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
}