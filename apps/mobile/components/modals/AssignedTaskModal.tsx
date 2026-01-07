import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Dimensions, Modal, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import type { AssignedTask } from '../../lib/mock-data';
import type { Product } from '../../types';

interface AssignedTaskModalProps {
  visible: boolean;
  task: AssignedTask | null;
  product: Product | null;
  onClose: () => void;
}

const { width: screenWidth } = Dimensions.get('window');

export default function AssignedTaskModal({
  visible,
  task,
  product,
  onClose
}: AssignedTaskModalProps) {
  if (!visible || !task || !product) {
    return null;
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return { bg: 'bg-red-50', text: 'text-red-800', border: 'border-red-500', badge: 'bg-red-500' };
      case 'high': return { bg: 'bg-orange-50', text: 'text-orange-800', border: 'border-orange-500', badge: 'bg-orange-500' };
      case 'medium': return { bg: 'bg-yellow-50', text: 'text-yellow-800', border: 'border-yellow-500', badge: 'bg-yellow-500' };
      case 'low': return { bg: 'bg-blue-50', text: 'text-blue-800', border: 'border-blue-500', badge: 'bg-blue-500' };
      default: return { bg: 'bg-gray-50', text: 'text-gray-800', border: 'border-gray-500', badge: 'bg-gray-500' };
    }
  };

  const getTaskTypeInfo = (type: string) => {
    switch (type) {
      case 'revisione': return { label: 'Revisione', icon: 'search-outline', color: '#007AFF' };
      case 'sostituzione': return { label: 'Sostituzione', icon: 'swap-horizontal-outline', color: '#FF9500' };
      case 'dismissione': return { label: 'Dismissione', icon: 'trash-outline', color: '#FF3B30' };
      case 'installazione': return { label: 'Installazione', icon: 'hammer-outline', color: '#34C759' };
      default: return { label: 'Generico', icon: 'build-outline', color: '#6B7280' };
    }
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'assigned': return { label: 'Assegnato', color: '#3B82F6' };
      case 'in_progress': return { label: 'In Corso', color: '#F59E0B' };
      case 'completed': return { label: 'Completato', color: '#10B981' };
      case 'cancelled': return { label: 'Annullato', color: '#EF4444' };
      default: return { label: 'Sconosciuto', color: '#6B7280' };
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

  const priorityColors = getPriorityColor(task.priority);
  const taskTypeInfo = getTaskTypeInfo(task.task_type);
  const statusInfo = getStatusInfo(task.status);

  const handleViewProduct = () => {
    onClose();
    router.push(`/pages/product/${task.productId}`);
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/50 justify-center items-center px-5">
        <View 
          className="bg-white rounded-2xl shadow-2xl relative"
          style={{ 
            width: Math.min(screenWidth - 40, 400), 
            maxHeight: '90%',
            minHeight: 500
          }}
        >
          {/* Header */}
          <View className="flex-row items-center justify-between p-5 border-b border-gray-100">
            <View className="flex-1">
              <Text className="text-xl font-semibold text-gray-800">Dettaglio dell&apos;intervento</Text>
              <Text className="text-gray-500 text-sm mt-1">
                {taskTypeInfo.label} • QR {task.qr_code}
              </Text>
              <View className="flex-row items-center mt-2">
                <Ionicons name="calendar" size={16} color="#059669" />
                <Text className="text-green-800 font-medium ml-1 text-sm">
                  Assegnato il {formatDate(task.assigned_date)}
                </Text>
              </View>
            </View>
            <TouchableOpacity 
              onPress={onClose}
              className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center"
            >
              <Ionicons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Task Type & Priority */}
            <View className="p-5 border-b border-gray-100">
              <View className="flex-row items-center justify-between mb-4">
                <View className="flex-row items-center">
                  <View 
                    className="w-12 h-12 rounded-full justify-center items-center mr-3"
                    style={{ backgroundColor: taskTypeInfo.color + '20' }}
                  >
                    <Ionicons name={taskTypeInfo.icon as any} size={24} color={taskTypeInfo.color} />
                  </View>
                  <View>
                    <Text className="text-lg font-semibold text-gray-800">{taskTypeInfo.label}</Text>
                    <Text className="text-sm text-gray-500">{statusInfo.label}</Text>
                  </View>
                </View>
                
                <View className={`px-3 py-1 rounded-full ${priorityColors.bg} ${priorityColors.border} border`}>
                  <Text className={`text-sm font-medium ${priorityColors.text}`}>
                    {task.priority.toUpperCase()}
                  </Text>
                </View>
              </View>

              {/* Description */}
              <View className="bg-gray-50 p-4 rounded-xl">
                <Text className="text-gray-800 font-medium text-base">{task.description}</Text>
              </View>
            </View>

            {/* Product Info */}
            <View className="p-5 border-b border-gray-100">
              <Text className="text-gray-800 font-semibold text-lg mb-3">Prodotto</Text>
              <View className="bg-blue-50 p-4 rounded-xl">
                <View className="flex-row items-center justify-between mb-2">
                  <Text className="text-gray-600 font-medium">Tipo Segnale:</Text>
                  <Text className="text-blue-800 font-semibold flex-1 text-right">{product.tipo_segnale}</Text>
                </View>
                <View className="flex-row items-center justify-between mb-2">
                  <Text className="text-gray-600 font-medium">Anno:</Text>
                  <Text className="text-blue-800 font-semibold flex-1 text-right">{product.anno}</Text>
                </View>
                <View className="flex-row items-center justify-between mb-2">
                  <Text className="text-gray-600 font-medium">Forma:</Text>
                  <Text className="text-blue-800 font-semibold flex-1 text-right">{product.forma}</Text>
                </View>
                <View className="flex-row items-center justify-between mb-2">
                  <Text className="text-gray-600 font-medium">Materiale Supporto:</Text>
                  <Text className="text-blue-800 font-semibold flex-1 text-right">{product.materiale_supporto}</Text>
                </View>
                <View className="flex-row items-center justify-between mb-2">
                  <Text className="text-gray-600 font-medium">Spessore:</Text>
                  <Text className="text-blue-800 font-semibold flex-1 text-right">{product.spessore_supporto}mm</Text>
                </View>
                <View className="flex-row items-center justify-between mb-2">
                  <Text className="text-gray-600 font-medium">Codice WL:</Text>
                  <Text className="text-blue-800 font-semibold flex-1 text-right">{product.wl}</Text>
                </View>
                <View className="flex-row items-center justify-between mb-2">
                  <Text className="text-gray-600 font-medium">Fissaggio:</Text>
                  <Text className="text-blue-800 font-semibold flex-1 text-right">{product.fissaggio}</Text>
                </View>
                <View className="flex-row items-center justify-between mb-2">
                  <Text className="text-gray-600 font-medium">Dimensioni:</Text>
                  <Text className="text-blue-800 font-semibold flex-1 text-right">{product.dimensioni}</Text>
                </View>
                <View className="flex-row items-center justify-between mb-2">
                  <Text className="text-gray-600 font-medium">Materiale Pellicola:</Text>
                  <Text className="text-blue-800 font-semibold flex-1 text-right">{product.materiale_pellicola}</Text>
                </View>
                {(product.gps_lat && product.gps_lng) && (
                  <View className="flex-row items-center justify-between mb-2">
                    <Text className="text-gray-600 font-medium">Posizione GPS:</Text>
                    <Text className="text-blue-800 font-semibold flex-1 text-right">
                      {product.gps_lat.toFixed(4)}, {product.gps_lng.toFixed(4)}
                    </Text>
                  </View>
                )}
                <View className="flex-row items-center justify-between">
                  <Text className="text-gray-600 font-medium">QR Code:</Text>
                  <Text className="text-blue-800 font-semibold flex-1 text-right">{product.qr_code}</Text>
                </View>
              </View>
            </View>



            {/* Notes */}
            {task.notes && (
              <View className="p-5">
                <Text className="text-gray-800 font-semibold text-lg mb-3">Note Aggiuntive</Text>
                <View className="bg-yellow-50 p-4 rounded-xl border-l-4 border-yellow-500">
                  <Text className="text-yellow-800 text-sm leading-5">
                    {task.notes}
                  </Text>
                </View>
              </View>
            )}
          </ScrollView>

          {/* Action Buttons */}
          <View className="p-5 border-t border-gray-200 bg-white rounded-b-2xl">
            <TouchableOpacity
              className="bg-blue-500 p-4 rounded-xl flex-row items-center justify-center"
              onPress={handleViewProduct}
              activeOpacity={0.8}
            >
              <Ionicons name="document-text" size={20} color="white" />
              <Text className="text-white font-semibold text-base ml-2">
                Visualizza Prodotto
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}