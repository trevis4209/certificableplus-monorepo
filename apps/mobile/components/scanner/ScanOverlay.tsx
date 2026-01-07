// Componente overlay per la scansione QR
// Mostra la cornice di targeting e feedback visivo durante la scansione

import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ScanOperation, ScanOverlayProps } from '../../types/scanner';

const ScanOverlay: React.FC<ScanOverlayProps> = React.memo(({ scanned, selectedOperation }: { scanned: boolean; selectedOperation?: ScanOperation | null }) => {
  // Funzione per ottenere il testo dinamico basato sull'operazione selezionata
  const getOperationText = (operation: ScanOperation | null | undefined): string => {
    switch (operation) {
      case 'add_intervention':
        return 'Scansiona per aggiungere nuovo intervento';
      case 'view_product':
        return 'Scansiona per vedere dati prodotto';
      case 'create_product':
        return 'Scansiona per creare nuovo prodotto';
      case null:
      case undefined:
      default:
        return 'Scansiona per aggiungere nuovo intervento'; // Default alla prima operazione
    }
  };

  return (
    <>
      {/* Overlay di targeting quando non scansionato */}
      {!scanned && (
        <View 
          style={StyleSheet.absoluteFillObject} 
          className="items-center justify-center" 
          pointerEvents="none"
        >
          <View className="w-64 h-64 relative">
            {/* Angoli della cornice di targeting */}
            <View className="absolute top-0 left-0 w-8 h-8 border-l-4 border-t-4 border-white" />
            <View className="absolute top-0 right-0 w-8 h-8 border-r-4 border-t-4 border-white" />
            <View className="absolute bottom-0 left-0 w-8 h-8 border-l-4 border-b-4 border-white" />
            <View className="absolute bottom-0 right-0 w-8 h-8 border-r-4 border-b-4 border-white" />
          </View>
          
          {/* Testo dinamico basato sull'operazione selezionata */}
          <Text className="text-white/80 text-center mt-6 mx-8 text-sm">
            {getOperationText(selectedOperation)}
          </Text>
        </View>
      )}

      {/* Overlay di feedback durante la scansione */}
      {scanned && (
        <View 
          style={StyleSheet.absoluteFillObject} 
          className="bg-black/80 items-center justify-center"
        >
          <View className="bg-white p-6 rounded-xl mx-6 max-w-sm">
            <Ionicons 
              name="checkmark-circle" 
              size={48} 
              color="#10B981" 
              style={{ alignSelf: 'center', marginBottom: 16 }} 
            />
            <Text className="text-gray-800 font-semibold text-lg text-center mb-2">
              QR Code Scansionato!
            </Text>
            <Text className="text-gray-600 text-center">
              Elaborazione in corso...
            </Text>
          </View>
        </View>
      )}
    </>
  );
});

ScanOverlay.displayName = 'ScanOverlay';

export default ScanOverlay;