import { Link, Stack } from 'expo-router';
import React from 'react';
import { Text, View } from 'react-native';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Oops!' }} />
      <View className="flex-1 items-center justify-center p-4 bg-white dark:bg-gray-900">
        <Text className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">Questa pagina non esiste.</Text>
        <Link href="/" className="mt-2">
          <Text className="text-blue-500 dark:text-blue-400 font-semibold">Torna alla home!</Text>
        </Link>
      </View>
    </>
  );
}
