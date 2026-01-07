import Header from '@/components/layout/Header';
import CreateProductModal from '@/components/modals/CreateProductModal';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';

export default function HomeScreen() {
  // State per il modal di creazione prodotto
  const [showCreateModal, setShowCreateModal] = useState(false);

  const quickActions = [
    { 
      title: 'Aggiungi Intervento', 
      subtitle: 'Scansiona per aggiungere', 
      icon: 'construct', 
      color: 'bg-teal-500', 
      operation: 'add_intervention'
    },
    { 
      title: 'Visualizza Dati Prodotto', 
      subtitle: 'Scansiona per info', 
      icon: 'information-circle', 
      color: 'bg-blue-500', 
      operation: 'view_product'
    },
    { 
      title: 'Crea Prodotto', 
      subtitle: 'Scansiona per creare', 
      icon: 'add-circle', 
      color: 'bg-green-500', 
      operation: 'create_product'
    },
  ];

  const handleQuickAction = (operation: string) => {
    // Se è "create_product", apri il modal invece di navigare
    if (operation === 'create_product') {
      setShowCreateModal(true);
      return;
    }

    // Altrimenti naviga allo scanner con il parametro operation
    router.push(`/pages/scanner?operation=${operation}` as any);
  };

  return (
    <View className="flex-1 bg-gray-50">
      {/* Fixed Header */}
      <Header 
        title="Dashboard"
        subtitle="Centro operativo dipendente"
        showNotification={false}
        onNotificationPress={() => console.log('Notifications pressed')}
      />

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>

      {/* Quick Actions */}
      <View className="mx-4 mb-6 mt-4">
        <Text className="text-gray-800 text-xl font-bold mb-4">Azioni Rapide</Text>
        <View className="flex-col space-y-3 gap-2">
          {quickActions.map((action, index) => (
            <TouchableOpacity
              key={index}
              className="w-full"
              onPress={() => handleQuickAction(action.operation)}
              activeOpacity={0.85}
            >
              <View className="bg-white p-5 rounded-2xl shadow-sm flex-row items-center">
                <View className={`${action.color} p-4 rounded-2xl w-16 h-16 items-center justify-center mr-4 shadow-md`}>
                  <Ionicons name={action.icon as any} size={28} color="white" />
                </View>
                <View className="flex-1">
                  <Text className="text-gray-900 font-bold text-lg mb-1">{action.title}</Text>
                  <Text className="text-gray-600 text-sm leading-5">{action.subtitle}</Text>
                </View>
                <View className="ml-2">
                  <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      </ScrollView>

      {/* Modal di creazione prodotto */}
      <CreateProductModal
        visible={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={() => {
          setShowCreateModal(false);
          // Opzionale: qui si può aggiungere un refresh della lista prodotti
        }}
      />
    </View>
  );
}


