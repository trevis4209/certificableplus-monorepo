import Header from '@/components/layout/Header';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useMaintenances } from '@/hooks/useMaintenance';
import { useProducts } from '@/hooks/useProducts';
import { useAuth } from '@/contexts/AuthContext';
import type { Maintenance } from '@certplus/types';

export default function MaintenanceDetailPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const companyId = user?.companyId || 'default-company';
  const userId = user?.id || 'default-user';

  // Fetch all maintenances and products
  const { maintenances, loading: loadingMaintenances, error: maintenanceError } = useMaintenances(userId);
  const { products, loading: loadingProducts } = useProducts(companyId);

  const loading = loadingMaintenances || loadingProducts;

  // Find the specific maintenance by id
  const maintenance = maintenances.find(m => m.id === id);

  // Find associated product
  const product = maintenance ? products.find(p => p.id === maintenance.productId) : null;

  // Helper to safely format GPS coordinates
  const formatGPS = (coord: number | string | undefined): string => {
    if (coord === undefined || coord === null) return 'N/A';
    const num = typeof coord === 'string' ? parseFloat(coord) : coord;
    return isNaN(num) ? 'N/A' : num.toFixed(6);
  };

  if (!id) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <Ionicons name="alert-circle-outline" size={48} color="#9CA3AF" />
        <Text className="text-lg text-gray-600 mt-3">ID Intervento non valido</Text>
        <TouchableOpacity
          onPress={() => router.back()}
          className="mt-4 bg-teal-500 px-4 py-2 rounded-lg"
        >
          <Text className="text-white font-medium">Torna Indietro</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (loading) {
    return (
      <View className="flex-1 bg-gray-50">
        <Header
          title="Dettaglio Intervento"
          subtitle="Caricamento..."
          backgroundColor="bg-teal-600"
          showBackButton={true}
          onBackPress={() => router.back()}
        />
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#0891b2" />
          <Text className="text-gray-600 mt-4">Caricamento dettagli intervento...</Text>
        </View>
      </View>
    );
  }

  if (maintenanceError || !maintenance) {
    return (
      <View className="flex-1 bg-gray-50">
        <Header
          title="Dettaglio Intervento"
          subtitle="Errore"
          backgroundColor="bg-teal-600"
          showBackButton={true}
          onBackPress={() => router.back()}
        />
        <View className="flex-1 justify-center items-center px-6">
          <Ionicons name="alert-circle-outline" size={48} color="#9CA3AF" />
          <Text className="text-lg text-gray-600 mt-3 text-center">Intervento non trovato</Text>
          {maintenanceError && (
            <Text className="text-sm text-gray-500 mt-2 text-center">{maintenanceError.message}</Text>
          )}
          <TouchableOpacity
            onPress={() => router.back()}
            className="mt-4 bg-teal-500 px-4 py-2 rounded-lg"
          >
            <Text className="text-white font-medium">Torna Indietro</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const getInterventionIcon = (type: Maintenance['tipo_intervento']) => {
    switch (type) {
      case 'installazione': return 'construct';
      case 'manutenzione': return 'build';
      case 'verifica': return 'checkmark-circle';
      case 'sostituzione': return 'swap-horizontal';
      case 'dismissione': return 'trash';
      default: return 'document';
    }
  };

  const getInterventionBgColor = (type: Maintenance['tipo_intervento']) => {
    switch (type) {
      case 'installazione': return 'bg-blue-500';
      case 'manutenzione': return 'bg-green-500';
      case 'verifica': return 'bg-yellow-500';
      case 'sostituzione': return 'bg-orange-500';
      case 'dismissione': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleBackPress = () => {
    router.back();
  };

  const handleProductPress = () => {
    if (product) {
      router.push(`/pages/product/${product.id}` as any);
    }
  };

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <Header
        title="Dettaglio Intervento"
        subtitle="Informazioni complete dell'intervento"
        backgroundColor="bg-teal-600"
        showBackButton={true}
        onBackPress={handleBackPress}
      />

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>

        {/* Maintenance Info Card */}
        <View className="mx-4 mt-4 mb-6">
          <View className="bg-white rounded-xl shadow-sm p-6">
            <View className="flex-row items-center mb-4">
              <View className={`${getInterventionBgColor(maintenance.tipo_intervento)} p-3 rounded-full mr-4`}>
                <Ionicons
                  name={getInterventionIcon(maintenance.tipo_intervento) as any}
                  size={24}
                  color="white"
                />
              </View>
              <View className="flex-1">
                <Text className="text-xl font-bold text-gray-800 capitalize">
                  {maintenance.tipo_intervento}
                </Text>
                <Text className="text-gray-600">
                  {formatDateTime(maintenance.createdAt)}
                </Text>
              </View>
            </View>

            <View className="border-t border-gray-100 pt-4">
              <View className="space-y-3">

                {/* Notes */}
                {maintenance.note && (
                  <View className="py-2">
                    <View className="flex-row items-center mb-2">
                      <Ionicons name="document-text-outline" size={16} color="#6B7280" />
                      <Text className="text-gray-600 font-medium ml-2">Note</Text>
                    </View>
                    <Text className="text-gray-800 leading-5 pl-6">{maintenance.note}</Text>
                  </View>
                )}

                {/* GPS Location */}
                {(maintenance.gps_lat && maintenance.gps_lng) && (
                  <View className="py-2">
                    <View className="flex-row items-center mb-2">
                      <Ionicons name="location-outline" size={16} color="#6B7280" />
                      <Text className="text-gray-600 font-medium ml-2">Posizione GPS</Text>
                    </View>
                    <Text className="text-gray-800 font-mono pl-6">
                      {formatGPS(maintenance.gps_lat)}, {formatGPS(maintenance.gps_lng)}
                    </Text>
                  </View>
                )}

                {/* Year */}
                {maintenance.year && (
                  <View className="flex-row items-center justify-between py-2">
                    <View className="flex-row items-center">
                      <Ionicons name="calendar-outline" size={16} color="#6B7280" />
                      <Text className="text-gray-600 font-medium ml-2">Anno</Text>
                    </View>
                    <Text className="text-gray-800">{maintenance.year}</Text>
                  </View>
                )}

                {/* Poles Number */}
                {maintenance.poles_number && (
                  <View className="flex-row items-center justify-between py-2">
                    <View className="flex-row items-center">
                      <Ionicons name="analytics-outline" size={16} color="#6B7280" />
                      <Text className="text-gray-600 font-medium ml-2">Numero Pali</Text>
                    </View>
                    <Text className="text-gray-800">{maintenance.poles_number}</Text>
                  </View>
                )}

                {/* Reason */}
                {maintenance.reason && (
                  <View className="py-2">
                    <View className="flex-row items-center mb-2">
                      <Ionicons name="information-circle-outline" size={16} color="#6B7280" />
                      <Text className="text-gray-600 font-medium ml-2">Motivazione</Text>
                    </View>
                    <Text className="text-gray-800 pl-6">{maintenance.reason}</Text>
                  </View>
                )}

                {/* Certificate Number */}
                {maintenance.certificate_number && (
                  <View className="flex-row items-center justify-between py-2">
                    <View className="flex-row items-center">
                      <Ionicons name="ribbon-outline" size={16} color="#6B7280" />
                      <Text className="text-gray-600 font-medium ml-2">Numero Certificato</Text>
                    </View>
                    <Text className="text-gray-800 font-mono text-sm">{maintenance.certificate_number}</Text>
                  </View>
                )}

                {/* Company ID */}
                {maintenance.company_id && (
                  <View className="flex-row items-center justify-between py-2">
                    <View className="flex-row items-center">
                      <Ionicons name="business-outline" size={16} color="#6B7280" />
                      <Text className="text-gray-600 font-medium ml-2">ID Azienda</Text>
                    </View>
                    <Text className="text-gray-800 font-mono text-sm">{maintenance.company_id}</Text>
                  </View>
                )}

                {/* Photos */}
                {maintenance.foto_urls && maintenance.foto_urls.length > 0 && (
                  <View className="py-2">
                    <View className="flex-row items-center">
                      <Ionicons name="camera-outline" size={16} color="#6B7280" />
                      <Text className="text-gray-600 font-medium ml-2">
                        {maintenance.foto_urls.length} {maintenance.foto_urls.length === 1 ? 'foto allegata' : 'foto allegate'}
                      </Text>
                    </View>
                  </View>
                )}
              </View>
            </View>
          </View>
        </View>

        {/* Associated Product Card */}
        {product && (
          <View className="mx-4 mb-6">
            <Text className="text-gray-800 text-lg font-semibold mb-3">Prodotto Associato</Text>
            <TouchableOpacity
              onPress={handleProductPress}
              className="bg-white rounded-xl shadow-sm p-6"
            >
              <View className="flex-row items-center mb-4">
                <View className="bg-teal-100 p-3 rounded-full mr-3">
                  <Ionicons name="cube" size={24} color="#0891b2" />
                </View>
                <View className="flex-1">
                  <Text className="text-lg font-bold text-gray-800">{product.tipo_segnale}</Text>
                  <Text className="text-gray-600">{product.forma} - {product.dimensioni}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#6B7280" />
              </View>

              <View className="border-t border-gray-100 pt-3">
                <View className="flex-row items-center justify-between py-2">
                  <View className="flex-row items-center">
                    <Ionicons name="qr-code-outline" size={14} color="#6B7280" />
                    <Text className="text-sm text-gray-600 ml-2">QR Code</Text>
                  </View>
                  <Text className="text-sm text-gray-800 font-mono">{product.qr_code}</Text>
                </View>

                <View className="flex-row items-center justify-between py-2">
                  <View className="flex-row items-center">
                    <Ionicons name="calendar-outline" size={14} color="#6B7280" />
                    <Text className="text-sm text-gray-600 ml-2">Anno</Text>
                  </View>
                  <Text className="text-sm text-gray-800">{product.anno}</Text>
                </View>
              </View>

              <View className="mt-3 pt-3 border-t border-gray-100">
                <Text className="text-xs text-teal-600 font-medium">
                  Tocca per vedere tutti i dettagli del prodotto �
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        )}

        {/* Blockchain Info */}
        <View className="mx-4 mb-6">
          <Text className="text-gray-800 text-lg font-semibold mb-3">Informazioni Blockchain</Text>
          <View className="bg-white rounded-xl shadow-sm p-6">
            <View className="flex-row items-center mb-4">
              <View className="bg-purple-100 p-3 rounded-full mr-3">
                <Ionicons name="cube-outline" size={24} color="#7C3AED" />
              </View>
              <Text className="text-lg font-bold text-gray-800">Tokenizzazione Algorand</Text>
            </View>

            <View className="bg-purple-50 p-4 rounded-lg">
              <View className="flex-row items-start mb-3">
                <Ionicons name="information-circle-outline" size={20} color="#7C3AED" />
                <Text className="text-sm text-purple-900 ml-2 flex-1">
                  Questo intervento � registrato sulla blockchain Algorand con storage su IPFS
                </Text>
              </View>

              <View className="space-y-2 mt-3">
                <View className="bg-white p-3 rounded-lg">
                  <Text className="text-xs text-gray-600 mb-1">Eseguito da</Text>
                  <Text className="text-sm font-mono text-gray-800">{maintenance.userId}</Text>
                </View>

                <View className="bg-white p-3 rounded-lg">
                  <Text className="text-xs text-gray-600 mb-1">Data Esecuzione</Text>
                  <Text className="text-sm text-gray-800">{formatDateTime(maintenance.createdAt)}</Text>
                </View>

                {/* Asset ID */}
                {maintenance.asset_id && (
                  <View className="bg-white p-3 rounded-lg">
                    <Text className="text-xs text-gray-600 mb-1">Algorand Asset ID</Text>
                    <Text className="text-sm font-mono text-gray-800">{maintenance.asset_id}</Text>
                  </View>
                )}

                {/* Metadata CID */}
                {maintenance.metadata_cid && (
                  <View className="bg-white p-3 rounded-lg">
                    <Text className="text-xs text-gray-600 mb-1">IPFS Metadata CID</Text>
                    <Text className="text-xs font-mono text-gray-800 break-all">
                      {maintenance.metadata_cid}
                    </Text>
                  </View>
                )}

                {/* Transaction ID */}
                {maintenance.transaction_id && (
                  <View className="bg-white p-3 rounded-lg">
                    <Text className="text-xs text-gray-600 mb-1">Transaction ID</Text>
                    <Text className="text-xs font-mono text-gray-800 break-all">
                      {maintenance.transaction_id}
                    </Text>
                  </View>
                )}
              </View>

              {/* Show message if blockchain data is not available */}
              {!maintenance.asset_id && !maintenance.metadata_cid && !maintenance.transaction_id && (
                <View className="mt-3 pt-3 border-t border-purple-200">
                  <Text className="text-xs text-gray-500 text-center">
                    I dati blockchain saranno disponibili dopo la creazione dell'intervento
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>

      </ScrollView>
    </View>
  );
}
