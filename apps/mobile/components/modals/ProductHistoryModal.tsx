import { Modal, View, Text, TouchableOpacity, ScrollView, Dimensions, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Product, Maintenance } from '../../types';
import { useMaintenancesByProduct } from '@/hooks/useMaintenance';
import { useAuth } from '@/contexts/AuthContext';

interface ProductHistoryModalProps {
  visible: boolean;
  product: Product | null;
  onClose: () => void;
}

const { width: screenWidth } = Dimensions.get('window');

const getEventIcon = (eventType: Maintenance['tipo_intervento']) => {
  switch (eventType) {
    case 'installazione': return 'hammer-outline';
    case 'manutenzione': return 'build-outline';
    case 'verifica': return 'checkmark-circle-outline';
    case 'sostituzione': return 'swap-horizontal-outline';
    case 'dismissione': return 'trash-outline';
    default: return 'ellipse-outline';
  }
};

const getEventColor = (eventType: Maintenance['tipo_intervento']) => {
  switch (eventType) {
    case 'installazione': return '#34C759';
    case 'manutenzione': return '#FF9500';
    case 'verifica': return '#30D158';
    case 'sostituzione': return '#FF9F0A';
    case 'dismissione': return '#FF3B30';
    default: return '#8E8E93';
  }
};


const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('it-IT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};


export default function ProductHistoryModal({
  visible,
  product,
  onClose
}: ProductHistoryModalProps) {
  const { user } = useAuth();
  const userId = user?.id || 'default-user';

  const { maintenances: history, loading } = useMaintenancesByProduct(
    product?.id || null,
    userId
  );

  if (!visible || !product) {
    return null;
  }

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/50 justify-center items-center px-2">
        <View 
          className="bg-white rounded-2xl shadow-2xl max-h-[90%]"
          style={{ width: Math.min(screenWidth - 20, 450) }}
        >
          {/* Header */}
          <View className="flex-row justify-between items-center p-5 border-b border-gray-100">
            <View className="flex-1">
              <Text className="text-xl font-semibold text-gray-800">Cronologia Prodotto</Text>
              <Text className="text-sm text-gray-600 mt-1">{product.qr_code}</Text>
            </View>
            <TouchableOpacity onPress={onClose} className="p-1">
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
            {/* Loading State */}
            {loading && (
              <View className="p-5 items-center justify-center">
                <ActivityIndicator size="large" color="#0891b2" />
                <Text className="text-gray-600 mt-3">Caricamento cronologia...</Text>
              </View>
            )}

            {/* History Timeline Section */}
            {!loading && (
            <View className="p-5">
              <View className="flex-row items-center mb-4">
                <Ionicons name="time-outline" size={20} color="#007AFF" />
                <Text className="text-lg font-semibold text-gray-800 ml-2">Timeline Eventi</Text>
              </View>
              
              {history.map((maintenance, index) => (
                <View key={maintenance.id} className="flex-row mb-4">
                  {/* Timeline line */}
                  <View className="items-center mr-4">
                    <View
                      className="w-10 h-10 rounded-full justify-center items-center"
                      style={{ backgroundColor: getEventColor(maintenance.tipo_intervento) + '20' }}
                    >
                      <Ionicons
                        name={getEventIcon(maintenance.tipo_intervento) as any}
                        size={20}
                        color={getEventColor(maintenance.tipo_intervento)}
                      />
                    </View>
                    {index < history.length - 1 && (
                      <View className="w-0.5 h-8 bg-gray-200 mt-2" />
                    )}
                  </View>

                  {/* Event content */}
                  <View className="flex-1 bg-gray-50 rounded-xl p-4">
                    <View className="flex-row justify-between items-start mb-2">
                      <Text className="text-sm font-semibold text-gray-800 flex-1 capitalize">
                        {maintenance.tipo_intervento}
                      </Text>
                      <Text className="text-xs text-gray-500 ml-2">
                        {formatDate(maintenance.createdAt)}
                      </Text>
                    </View>

                    {maintenance.note && (
                      <Text className="text-xs text-gray-600 mb-2">
                        {maintenance.note}
                      </Text>
                    )}

                    {(maintenance.gps_lat && maintenance.gps_lng) && (
                      <Text className="text-xs text-gray-500 mb-1">
                        📍 {maintenance.gps_lat.toFixed(6)}, {maintenance.gps_lng.toFixed(6)}
                      </Text>
                    )}

                    {maintenance.foto_urls && maintenance.foto_urls.length > 0 && (
                      <View className="flex-row items-center mt-2">
                        <Ionicons name="camera-outline" size={12} color="#3B82F6" />
                        <Text className="text-xs text-blue-600 ml-1">
                          {maintenance.foto_urls.length} foto allegate
                        </Text>
                      </View>
                    )}

                    <View className="flex-row items-center mt-2">
                      <Ionicons name="shield-checkmark" size={12} color="#34C759" />
                      <Text className="text-xs text-green-600 ml-1">Registrato su blockchain</Text>
                    </View>
                  </View>
                </View>
              ))}
              
              {history.length === 0 && (
                <View className="items-center py-8">
                  <Ionicons name="document-outline" size={48} color="#8E8E93" />
                  <Text className="text-gray-500 mt-2">Nessun evento registrato</Text>
                </View>
              )}
            </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}