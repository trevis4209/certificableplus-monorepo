import Header from '@/components/layout/Header';
import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useMaintenances } from '@/hooks/useMaintenance';
import { useProducts } from '@/hooks/useProducts';
import { useAuth } from '@/contexts/AuthContext';
import { router } from 'expo-router';
import { useState, useCallback, useMemo } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import type { Maintenance } from '@certplus/types';

export default function MaintenancePage() {
  const { user } = useAuth();
  const userId = user?.id || 'default-user';
  const companyId = user?.companyId || 'default-company';

  const [selectedFilter, setSelectedFilter] = useState<Maintenance['tipo_intervento'] | 'tutti'>('tutti');

  // Fetch real data from backend - GET /maintenance
  const { maintenances, loading: loadingMaintenances, refetch: refetchMaintenances } = useMaintenances(userId);
  const { products, loading: loadingProducts, refetch: refetchProducts } = useProducts(companyId);

  const loading = loadingMaintenances || loadingProducts;

  // Refresh data when screen comes into focus (e.g., after creating a new maintenance in another tab)
  useFocusEffect(
    useCallback(() => {
      refetchMaintenances();
      refetchProducts();
    }, [refetchMaintenances, refetchProducts])
  );

  // Calculate counts for each intervention type using useMemo for performance
  const filterTabs = useMemo(() => [
    { key: 'tutti' as const, label: 'Tutti', count: maintenances.length, icon: 'list', color: 'bg-gray-500' },
    { key: 'installazione' as const, label: 'Installazioni', count: maintenances.filter(m => m.tipo_intervento === 'installazione').length, icon: 'construct', color: 'bg-blue-500' },
    { key: 'manutenzione' as const, label: 'Manutenzioni', count: maintenances.filter(m => m.tipo_intervento === 'manutenzione').length, icon: 'build', color: 'bg-green-500' },
    { key: 'verifica' as const, label: 'Verifiche', count: maintenances.filter(m => m.tipo_intervento === 'verifica').length, icon: 'checkmark-circle', color: 'bg-yellow-500' },
    { key: 'sostituzione' as const, label: 'Sostituzioni', count: maintenances.filter(m => m.tipo_intervento === 'sostituzione').length, icon: 'swap-horizontal', color: 'bg-orange-500' },
    { key: 'dismissione' as const, label: 'Dismissioni', count: maintenances.filter(m => m.tipo_intervento === 'dismissione').length, icon: 'trash', color: 'bg-red-500' },
  ], [maintenances]);

  // Filter interventions based on selected filter
  const filteredInterventions = useMemo(() =>
    selectedFilter === 'tutti'
      ? maintenances
      : maintenances.filter(m => m.tipo_intervento === selectedFilter),
    [maintenances, selectedFilter]
  );

  // Get product for maintenance (productId is now correctly mapped from /product endpoint)
  const getProductForMaintenance = (maintenance: Maintenance) => {
    return products.find(p => p.id === maintenance.productId);
  };
    
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Helper to safely format GPS coordinates
  const formatGPS = (coord: number | string | undefined): string => {
    if (coord === undefined || coord === null) return 'N/A';
    const num = typeof coord === 'string' ? parseFloat(coord) : coord;
    return isNaN(num) ? 'N/A' : num.toFixed(4);
  };

  const handleMaintenancePress = (maintenance: Maintenance) => {
    router.push(`/pages/maintenance/${maintenance.id}` as any);
  };

  return (
    <View className="flex-1 bg-gray-50">
      {/* Fixed Header */}
      <Header 
        title="Miei Interventi"
        subtitle="Gestire manutenzioni e interventi"
      />
      
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>

      {/* Loading State */}
      {loading && (
        <View className="flex-1 items-center justify-center py-20">
          <ActivityIndicator size="large" color="#0891b2" />
          <Text className="text-gray-600 mt-4">Caricamento interventi...</Text>
        </View>
      )}

      {!loading && (
        <>
      {/* Filter Tabs */}
      <View className="mb-6">
        <Text className="mt-4 text-gray-800 text-lg font-semibold mb-3 mx-4">Filtra Interventi</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="pl-4">
          <View className="flex-row space-x-3 gap-1">
            {filterTabs.map((tab) => (
              <TouchableOpacity
                key={tab.key}
                onPress={() => setSelectedFilter(tab.key)}
                className={`flex-row items-center p-2 shadow-sm mb-1 rounded-full border-1 ${
                  selectedFilter === tab.key 
                    ? `${tab.color} border-transparent` 
                    : 'bg-white border-gray-200'
                }`}
              >
                <Ionicons 
                  name={tab.icon as any} 
                  size={20} 
                  color={selectedFilter === tab.key ? 'white' : '#6B7280'} 
                />
                <Text 
                  className={`ml-2 font-semibold ${
                    selectedFilter === tab.key ? 'text-white' : 'text-gray-600'
                  }`}
                >
                  {tab.label}
                </Text>
                <View 
                  className={`ml-2 px-2 py-1 rounded-full ${
                    selectedFilter === tab.key ? 'bg-white/20' : 'bg-gray-100'
                  }`}
                >
                  <Text 
                    className={`text-xs font-bold ${
                      selectedFilter === tab.key ? 'text-white' : 'text-gray-700'
                    }`}
                  >
                    {tab.count}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* Intervention Cards */}
      <View className="mx-4 mb-6">
        <Text className="text-gray-800 text-lg font-semibold mb-3">
          {selectedFilter === 'tutti' ? 'Tutti gli Interventi' : filterTabs.find(t => t.key === selectedFilter)?.label}
          <Text className="text-gray-500 font-normal text-base"> ({filteredInterventions.length})</Text>
        </Text>
        
        {filteredInterventions.length === 0 ? (
          <View className="bg-white p-8 rounded-xl shadow-sm items-center">
            <Ionicons name="folder-open-outline" size={48} color="#9CA3AF" />
            <Text className="text-gray-500 mt-3 text-center">
              Nessun intervento trovato per questo filtro
            </Text>
          </View>
        ) : (
          <View className="space-y-3 gap-2">
            {filteredInterventions.slice(0, 10).map((intervention) => {
              const typeConfig = filterTabs.find(t => t.key === intervention.tipo_intervento);
              const product = getProductForMaintenance(intervention);
              return (
                <TouchableOpacity
                  key={intervention.id}
                  className="bg-white p-4 rounded-xl shadow-sm"
                  onPress={() => handleMaintenancePress(intervention)}
                >
                  <View className="flex-row items-start">
                    <View className={`${typeConfig?.color || 'bg-gray-500'} p-3 rounded-full mr-3 mt-1`}>
                      <Ionicons name={typeConfig?.icon as any || 'document'} size={20} color="white" />
                    </View>
                    <View className="flex-1">
                      <View className="flex-row items-center justify-between mb-2">
                        <Text className="text-gray-800 font-bold text-base capitalize">
                          {intervention.tipo_intervento}
                        </Text>
                        <Text className="text-gray-400 text-xs">
                          {formatDate(intervention.createdAt)}
                        </Text>
                      </View>

                      <Text className="text-gray-600 text-sm mb-2">
                        {product ? `${product.tipo_segnale} - ${product.wl}` : 'Prodotto non trovato'}
                      </Text>

                      {intervention.note && (
                        <Text className="text-gray-500 text-xs mb-2 italic" numberOfLines={2}>
                          {intervention.note}
                        </Text>
                      )}
                      
                      <View className="flex-row items-center justify-between">
                        <View className="flex-row items-center">
                          <Ionicons name="location-outline" size={14} color="#6B7280" />
                          <Text className="text-gray-500 text-xs ml-1">
                            {formatGPS(intervention.gps_lat)}, {formatGPS(intervention.gps_lng)}
                          </Text>
                        </View>
                        
                        {intervention.foto_urls && intervention.foto_urls.length > 0 && (
                          <View className="flex-row items-center">
                            <Ionicons name="camera-outline" size={14} color="#6B7280" />
                            <Text className="text-gray-500 text-xs ml-1">
                              {intervention.foto_urls.length} foto
                            </Text>
                          </View>
                        )}
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
            
            {filteredInterventions.length > 10 && (
              <TouchableOpacity className="bg-gray-50 p-4 rounded-xl border-2 border-dashed border-gray-300">
                <Text className="text-gray-600 text-center font-medium">
                  Visualizza altri {filteredInterventions.length - 10} interventi
                </Text>
                <Text className="text-gray-400 text-center text-sm mt-1">
                  Tocca per caricare più elementi
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
      </>
      )}
      </ScrollView>
    </View>
  );
}