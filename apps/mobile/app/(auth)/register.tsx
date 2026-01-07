'use client';

import React from 'react';
import { Text, View } from 'react-native';

/**
 * Schermata di registrazione utente
 * Da personalizzare con form e logica di registrazione
 */
export default function RegisterScreen() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold' }}>Registrazione</Text>
      <Text style={{ marginTop: 12, color: '#6C757D' }}>
        Qui potrai creare un nuovo account.
      </Text>
    </View>
  );
} 