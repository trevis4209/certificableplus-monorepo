// Componente per la selezione dell'operazione di scansione
// Modal non dismissibile che forza l'utente a scegliere un'operazione

import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Modal, Text, TouchableOpacity, View } from 'react-native';
import { OperationSelectorProps, ScanOperation } from '../../types/scanner';

const OperationSelector: React.FC<OperationSelectorProps> = React.memo(({
  visible,
  onOperationSelect,
}) => {
  // Configurazione delle operazioni disponibili
  const operations = [
    {
      type: 'add_intervention' as ScanOperation,
      title: 'Aggiungi Intervento',
      description: 'Registra manutenzioni su prodotti esistenti',
      icon: 'construct',
      color: 'bg-teal-500',
      iconColor: 'white' as const,
    },
    {
      type: 'view_product' as ScanOperation,
      title: 'Visualizza Dati Prodotto',
      description: 'Consulta informazioni dettagliate',
      icon: 'information-circle',
      color: 'bg-blue-500',
      iconColor: 'white' as const,
    },
    {
      type: 'create_product' as ScanOperation,
      title: 'Crea Prodotto',
      description: 'Registra un nuovo cartello stradale',
      icon: 'add-circle',
      color: 'bg-green-500',
      iconColor: 'white' as const,
    },
  ];

  const handleOperationSelect = (operation: ScanOperation) => {
    onOperationSelect(operation);
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={() => {}} // Vuoto per renderlo non chiudibile
    >
      <View className="flex-1 bg-black/80 items-center justify-center px-6">
        <View className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl">
          {/* Header del modal */}
          <View className="items-center mb-6">
            <View className="w-16 h-16 bg-gray-100 rounded-full items-center justify-center mb-4">
              <Ionicons name="qr-code" size={32} color="#6B7280" />
            </View>
            <Text className="text-gray-900 text-xl font-bold text-center mb-2">
              Seleziona Operazione
            </Text>
            <Text className="text-gray-600 text-center">
              Che operazione vuoi eseguire oggi?
            </Text>
          </View>
          
          {/* Lista delle operazioni */}
          <View className="space-y-3">
            {operations.map((operation) => (
              <TouchableOpacity
                key={operation.type}
                onPress={() => handleOperationSelect(operation.type)}
                className={`${operation.color} p-4 rounded-xl active:opacity-75`}
                activeOpacity={0.75}
              >
                <View className="flex-row items-center">
                  <Ionicons 
                    name={operation.icon as any} 
                    size={24} 
                    color={operation.iconColor}
                    style={{ marginRight: 12 }} 
                  />
                  <View className="flex-1">
                    <Text className="text-white font-semibold text-lg">
                      {operation.title}
                    </Text>
                    <Text className="text-white/80 text-sm mt-1">
                      {operation.description}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* Footer con suggerimento */}
          <View className="mt-6 pt-4 border-t border-gray-200">
            <Text className="text-gray-500 text-xs text-center">
              💡 Suggerimento: Seleziona &ldquo;Aggiungi Intervento&rdquo; per la manutenzione quotidiana
            </Text>
          </View>
        </View>
      </View>
    </Modal>
  );
});

OperationSelector.displayName = 'OperationSelector';

export default OperationSelector;