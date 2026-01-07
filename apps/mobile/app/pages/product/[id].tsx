import Header from '@/components/layout/Header';
import QRCodeModal from '@/components/modals/QRCodeModal';
import { useAuth } from '@/contexts/AuthContext';
import { useMaintenancesByProduct } from '@/hooks/useMaintenance';
import { useProduct } from '@/hooks/useProducts';
import type { Maintenance } from '@certplus/types';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, Linking, ScrollView, Text, TouchableOpacity, View } from 'react-native';

export default function ProductDetailPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const companyId = user?.companyId || 'default-company';
  const userId = user?.id || 'default-user';

  // QR Code modal state
  const [showQRModal, setShowQRModal] = useState(false);

  // Fetch real product data
  const { product, loading: loadingProduct, error: productError } = useProduct(id || null, companyId);

  // Fetch maintenance history for this product
  const { maintenances: history, loading: loadingHistory } = useMaintenancesByProduct(id || null, userId);

  const loading = loadingProduct || loadingHistory;

  if (!id) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <Ionicons name="alert-circle-outline" size={48} color="#9CA3AF" />
        <Text className="text-lg text-gray-600 mt-3">ID Prodotto non valido</Text>
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
          title="Dettaglio Prodotto"
          subtitle="Caricamento..."
          backgroundColor="bg-teal-600"
          showBackButton={true}
          onBackPress={() => router.back()}
        />
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#0891b2" />
          <Text className="text-gray-600 mt-4">Caricamento dettagli prodotto...</Text>
        </View>
      </View>
    );
  }

  if (productError || !product) {
    return (
      <View className="flex-1 bg-gray-50">
        <Header
          title="Dettaglio Prodotto"
          subtitle="Errore"
          backgroundColor="bg-teal-600"
          showBackButton={true}
          onBackPress={() => router.back()}
        />
        <View className="flex-1 justify-center items-center px-6">
          <Ionicons name="alert-circle-outline" size={48} color="#9CA3AF" />
          <Text className="text-lg text-gray-600 mt-3 text-center">Prodotto non trovato</Text>
          {productError && (
            <Text className="text-sm text-gray-500 mt-2 text-center">{productError.message}</Text>
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

  // Get installation date from first maintenance with type 'installazione'
  const installationMaintenance = history.find(m => m.tipo_intervento === 'installazione');
  const installationDate = installationMaintenance?.createdAt;

  const getEventIcon = (type: Maintenance['tipo_intervento']) => {
    switch (type) {
      case 'installazione': return 'construct';
      case 'manutenzione': return 'build';
      case 'verifica': return 'checkmark-circle';
      case 'sostituzione': return 'swap-horizontal';
      case 'dismissione': return 'trash';
      default: return 'document';
    }
  };

  const getEventBgColor = (type: Maintenance['tipo_intervento']) => {
    switch (type) {
      case 'installazione': return 'bg-blue-500';
      case 'manutenzione': return 'bg-green-500';
      case 'verifica': return 'bg-yellow-500';
      case 'sostituzione': return 'bg-orange-500';
      case 'dismissione': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
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

  // Helper to safely format GPS coordinates
  const formatGPS = (coord: number | string | undefined): string => {
    if (coord === undefined || coord === null) return 'N/A';
    const num = typeof coord === 'string' ? parseFloat(coord) : coord;
    return isNaN(num) ? 'N/A' : num.toFixed(6);
  };

  const handleBackPress = () => {
    router.back();
  };

  // Open Algorand Asset on AlgoExplorer
  const handleOpenAsset = async () => {
    if (!product?.asset_id) {
      Alert.alert('Errore', 'Asset ID non disponibile');
      return;
    }

    const url = `https://testnet.algo.surf/asset/${product.asset_id}/transactions`;

    try {
      await Linking.openURL(url);
    } catch (error) {
      Alert.alert('Errore', 'Impossibile aprire il link. Verifica la connessione internet.');
      console.error('Error opening asset URL:', error);
    }
  };

  // Open IPFS Metadata on gateway
  const handleOpenMetadata = async () => {
    if (!product?.metadata_cid) {
      Alert.alert('Errore', 'Metadata CID non disponibile');
      return;
    }

    const url = `https://gateway.pinata.cloud/ipfs/${product.metadata_cid}`;

    try {
      await Linking.openURL(url);
    } catch (error) {
      Alert.alert('Errore', 'Impossibile aprire il link. Verifica la connessione internet.');
      console.error('Error opening metadata URL:', error);
    }
  };

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header with QR Code Action */}
      <Header
        title="Dettaglio Prodotto"
        subtitle="Informazioni complete del dispositivo"
        backgroundColor="bg-teal-600"
        showBackButton={true}
        onBackPress={handleBackPress}
        rightAction={
          <TouchableOpacity
            className="bg-white/20 p-3 rounded-full"
            onPress={() => setShowQRModal(true)}
          >
            <Ionicons name="qr-code" size={24} color="white" />
          </TouchableOpacity>
        }
      />
      
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        


        {/* Product Info Card */}
        <View className="mx-4 mt-4 mb-6">
          <View className="bg-white rounded-xl shadow-sm p-6">
            <View className="flex-row items-center mb-4">
              <View className="bg-teal-500 p-3 rounded-full mr-4">
                <Ionicons name="cube" size={24} color="white" />
              </View>
              <View className="flex-1">
                <Text className="text-xl font-bold text-gray-800">{product.tipo_segnale}</Text>
                <Text className="text-gray-600">Segnale stradale - {product.forma}</Text>
              </View>
            </View>
            
            <View className="border-t border-gray-100 pt-4">
              <View className="space-y-3">
                <View className="flex-row items-center justify-between py-2">
                  <View className="flex-row items-center">
                    <Ionicons name="qr-code-outline" size={16} color="#6B7280" />
                    <Text className="text-gray-600 font-medium ml-2">QR Code</Text>
                  </View>
                  <Text className="text-gray-800 font-mono">{product.qr_code}</Text>
                </View>
                
                <View className="flex-row items-center justify-between py-2">
                  <View className="flex-row items-center">
                    <Ionicons name="calendar-outline" size={16} color="#6B7280" />
                    <Text className="text-gray-600 font-medium ml-2">Anno</Text>
                  </View>
                  <Text className="text-gray-800">{product.anno}</Text>
                </View>
                
                <View className="flex-row items-center justify-between py-2">
                  <View className="flex-row items-center">
                    <Ionicons name="resize-outline" size={16} color="#6B7280" />
                    <Text className="text-gray-600 font-medium ml-2">Dimensioni</Text>
                  </View>
                  <Text className="text-gray-800">{product.dimensioni}</Text>
                </View>
                
                <View className="flex-row items-center justify-between py-2">
                  <View className="flex-row items-center">
                    <Ionicons name="layers-outline" size={16} color="#6B7280" />
                    <Text className="text-gray-600 font-medium ml-2">Materiale Supporto</Text>
                  </View>
                  <Text className="text-gray-800">{product.materiale_supporto}</Text>
                </View>
                
                <View className="flex-row items-center justify-between py-2">
                  <View className="flex-row items-center">
                    <Ionicons name="color-palette-outline" size={16} color="#6B7280" />
                    <Text className="text-gray-600 font-medium ml-2">Materiale Pellicola</Text>
                  </View>
                  <Text className="text-gray-800">{product.materiale_pellicola || 'N/A'}</Text>
                </View>
                
                {installationDate && (
                  <View className="flex-row items-center justify-between py-2">
                    <View className="flex-row items-center">
                      <Ionicons name="construct-outline" size={16} color="#6B7280" />
                      <Text className="text-gray-600 font-medium ml-2">Data Installazione</Text>
                    </View>
                    <Text className="text-gray-800">{formatDate(installationDate)}</Text>
                  </View>
                )}
              </View>
            </View>
          </View>
        </View>
                {/* Product History */}
        <View className="mx-4 mb-6">
          <Text className="text-gray-800 text-lg font-semibold mb-3">Cronologia Prodotto</Text>
          <View className="bg-white rounded-xl shadow-sm p-6">
            <View className="flex-row items-center mb-4">
              <View className="bg-blue-100 p-3 rounded-full mr-3">
                <Ionicons name="time" size={24} color="#3B82F6" />
              </View>
              <Text className="text-lg font-bold text-gray-800">Storico Interventi</Text>
            </View>
            
            {history.length > 0 ? (
              <View className="space-y-4">
                {history.map((maintenance: Maintenance, index: number) => (
                  <TouchableOpacity
                    key={maintenance.id}
                    onPress={() => router.push(`/pages/maintenance/${maintenance.id}`)}
                    activeOpacity={0.7}
                    className="flex-row"
                  >
                    <View className="flex-col items-center mr-4">
                      <View className={`${getEventBgColor(maintenance.tipo_intervento)} p-3 rounded-full`}>
                        <Ionicons
                          name={getEventIcon(maintenance.tipo_intervento) as any}
                          size={20}
                          color="white"
                        />
                      </View>
                      {index < history.length - 1 && (
                        <View className="w-0.5 h-12 bg-gray-300 mt-3" />
                      )}
                    </View>

                    <View className="flex-1 pb-6">
                      <View className="flex-row justify-between items-start mb-2">
                        <View className="flex-row items-center flex-1">
                          <Text className="text-lg font-semibold text-gray-800 capitalize">
                            {maintenance.tipo_intervento}
                          </Text>
                          <Ionicons name="chevron-forward" size={18} color="#9CA3AF" className="ml-2" />
                        </View>
                        <Text className="text-sm text-gray-500">
                          {formatDateTime(maintenance.createdAt)}
                        </Text>
                      </View>

                      {maintenance.note && (
                        <Text className="text-gray-600 mb-3 leading-5" numberOfLines={2}>
                          {maintenance.note}
                        </Text>
                      )}

                      {(maintenance.gps_lat && maintenance.gps_lng) && (
                        <View className="bg-gray-50 p-3 rounded-lg mb-2">
                          <View className="flex-row items-center">
                            <Ionicons name="location-outline" size={16} color="#6B7280" />
                            <Text className="text-sm text-gray-600 ml-2">
                              Posizione: <Text className="font-mono text-xs">
                                {formatGPS(maintenance.gps_lat)}, {formatGPS(maintenance.gps_lng)}
                              </Text>
                            </Text>
                          </View>
                        </View>
                      )}

                      {maintenance.foto_urls && maintenance.foto_urls.length > 0 && (
                        <View className="bg-blue-50 p-3 rounded-lg">
                          <View className="flex-row items-center">
                            <Ionicons name="camera-outline" size={16} color="#3B82F6" />
                            <Text className="text-sm text-blue-600 ml-2">
                              {maintenance.foto_urls.length} foto allegate
                            </Text>
                          </View>
                        </View>
                      )}
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <View className="text-center py-8">
                <Ionicons name="time-outline" size={32} color="#9CA3AF" />
                <Text className="text-gray-500 mt-3">Nessuna cronologia disponibile</Text>
              </View>
            )}
          </View>
        </View>

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
                  Questo prodotto è tokenizzato sulla blockchain Algorand con storage su IPFS
                </Text>
              </View>

              <View className="space-y-2 mt-3">
                <View className="bg-white p-3 rounded-lg">
                  <Text className="text-xs text-gray-600 mb-1">Creato da</Text>
                  <Text className="text-sm font-mono text-gray-800">{product.createdBy}</Text>
                </View>

                <View className="bg-white p-3 rounded-lg">
                  <Text className="text-xs text-gray-600 mb-1">Data Creazione</Text>
                  <Text className="text-sm text-gray-800">{formatDateTime(product.createdAt)}</Text>
                </View>

                {/* Asset ID with button */}
                {product.asset_id && (
                  <View className="bg-white p-3 rounded-lg">
                    <Text className="text-xs text-gray-600 mb-2">Algorand Asset ID</Text>
                    <View className="flex-row items-center justify-between">
                      <Text className="text-sm font-mono text-gray-800 flex-1 mr-2">
                        {product.asset_id}
                      </Text>
                      <TouchableOpacity
                        onPress={handleOpenAsset}
                        className="bg-purple-500 px-3 py-2 rounded-lg flex-row items-center"
                      >
                        <Ionicons name="open-outline" size={14} color="white" />
                        <Text className="text-white text-xs font-medium ml-1">Visualizza</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}

                {/* Metadata CID with button */}
                {product.metadata_cid && (
                  <View className="bg-white p-3 rounded-lg">
                    <Text className="text-xs text-gray-600 mb-2">IPFS Metadata CID</Text>
                    <Text className="text-xs font-mono text-gray-800 mb-2 break-all">
                      {product.metadata_cid}
                    </Text>
                    <TouchableOpacity
                      onPress={handleOpenMetadata}
                      className="bg-purple-500 px-3 py-2 rounded-lg flex-row items-center justify-center"
                    >
                      <Ionicons name="cloud-outline" size={14} color="white" />
                      <Text className="text-white text-xs font-medium ml-1">Visualizza su IPFS</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </View>

            {history.length > 0 && (
              <View className="mt-4 pt-4 border-t border-gray-200">
                <Text className="text-sm text-gray-600 mb-2">Storico Blockchain</Text>
                <Text className="text-xs text-gray-500">
                  {history.length} {history.length === 1 ? 'intervento registrato' : 'interventi registrati'} sulla blockchain
                </Text>
              </View>
            )}
          </View>
        </View>

      </ScrollView>

      {/* QR Code Modal */}
      {product && (
        <QRCodeModal
          visible={showQRModal}
          onClose={() => setShowQRModal(false)}
          product={product}
          companyName={user?.companyId}
        />
      )}
    </View>
  );
}