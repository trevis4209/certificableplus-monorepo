import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { ScanOperation } from '../../types/scanner';

interface TabSelectorProps {
  selectedOperation: ScanOperation | null;
  onOperationSelect: (operation: ScanOperation) => void;
}

const TabSelector: React.FC<TabSelectorProps> = React.memo(({ selectedOperation, onOperationSelect }) => {
  // Using the same quick actions from homepage for consistent UX
  const operations = [
    {
      id: 'add_intervention' as ScanOperation,
      title: 'Aggiungi Intervento',
      subtitle: 'Scansiona per aggiungere intervento',
      icon: 'construct' as keyof typeof Ionicons.glyphMap,
      color: 'bg-teal-500',
      borderColor: 'border-teal-400'
    },
    {
      id: 'view_product' as ScanOperation,
      title: 'Visualizza Dati Prodotto',
      subtitle: 'Scansiona per vedere dati prodotto',
      icon: 'information-circle' as keyof typeof Ionicons.glyphMap,
      color: 'bg-blue-500',
      borderColor: 'border-blue-400'
    },
  ];

  return (
    <View className="absolute bottom-0 left-0 right-0 bg-black/40 backdrop-blur-md">
      <View className="px-4 py-4">
        <View className="flex-row justify-between space-x-2 gap-2">
          {operations.map((operation) => {
            const isSelected = selectedOperation === operation.id;
            return (
              <TouchableOpacity
                key={operation.id}
                onPress={() => onOperationSelect(operation.id)}
                className={`flex-1 items-center px-3 py-3 rounded-xl ${
                  isSelected
                    ? `${operation.color} border-2 ${operation.borderColor}`
                    : 'bg-black/30 border-2 border-white/10'
                }`}
                activeOpacity={0.8}
              >
                <View className={`p-2 rounded-lg mb-2 ${isSelected ? 'bg-white/20' : 'bg-white/10'}`}>
                  <Ionicons
                    name={operation.icon}
                    size={24}
                    color="#FFFFFF"
                  />
                </View>
                <Text className={`text-white text-xs font-semibold text-center ${
                  isSelected ? 'opacity-100' : 'opacity-80'
                }`}>
                  {operation.title}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </View>
  );
});

TabSelector.displayName = 'TabSelector';

export default TabSelector;