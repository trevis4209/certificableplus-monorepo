import { Stack } from 'expo-router';
import React from 'react';

export default function PagesLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      {/* Product detail page */}
      <Stack.Screen 
        name="product/[id]" 
        options={{ 
          headerShown: false,
          title: 'Dettagli Prodotto'
        }} 
      />
    </Stack>
  );
}