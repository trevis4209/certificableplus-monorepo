// Componente per la visualizzazione dettagli prodotto
// Modal per mostrare tutte le informazioni di un prodotto scansionato

import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Modal, Image, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ProductViewerProps } from '../../types/scanner';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const ProductViewModal: React.FC<ProductViewerProps> = React.memo(({
  visible,
  product,
  onClose,
}) => {
  const router = useRouter();

  if (!product) {
    return null;
  }

  const handleNavigateToProduct = () => {
    // Chiudi il modal prima di navigare
    onClose();
    // Naviga alla pagina di dettaglio del prodotto
    router.push(`/pages/product/${product.id}`);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Converte coordinate GPS in indirizzo leggibile (mock)
  const getAddressFromGPS = (lat: number, lng: number): string => {
    const addresses = [
      "Via Roma 123, Milano MI",
      "Corso Italia 45, Roma RM",
      "Piazza Garibaldi 8, Torino TO",
      "Via Nazionale 67, Napoli NA",
      "Corso Buenos Aires 15, Milano MI"
    ];
    const index = Math.abs(Math.round(lat * lng)) % addresses.length;
    return addresses[index];
  };

  // Mock delle immagini prodotto
  const getProductImages = (qrCode: string): string[] => {
    return [
      "https://via.placeholder.com/300x200/3B82F6/FFFFFF?text=Segnale+Stradale",
      "https://via.placeholder.com/300x200/10B981/FFFFFF?text=Vista+Laterale",
      "https://via.placeholder.com/300x200/F59E0B/FFFFFF?text=Dettaglio+QR"
    ];
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/50 justify-center items-center px-4">
        <View
          className="bg-white rounded-2xl shadow-2xl overflow-hidden"
          style={{
            width: Math.min(screenWidth - 32, 600),
            height: screenHeight * 0.9,
          }}
        >
          {/* Header */}
          <View className="flex-row items-center p-5 border-b border-gray-200 bg-gradient-to-r from-blue-500/10">
            <View className="w-10 h-10 rounded-full bg-blue-500/10 items-center justify-center mr-3">
              <Ionicons name="cube" size={20} color="#3B82F6" />
            </View>
            <View className="flex-1">
              <Text className="text-xl font-bold text-gray-900">Dati Prodotto</Text>
              <Text className="text-sm text-gray-600">
                Informazioni complete del segnale stradale
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} className="p-2">
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          {/* Scrollable Content */}
          <ScrollView
            className="flex-1"
            showsVerticalScrollIndicator={true}
            contentContainerStyle={{ paddingBottom: 20 }}
          >
            {/* Product Summary */}
            <View className="px-6 py-4 bg-gray-50 border-b border-gray-200">
              <View className="flex-row items-center mb-3">
                <Ionicons name="information-circle" size={20} color="#3B82F6" />
                <Text className="text-base font-semibold text-gray-900 ml-2">Riepilogo Prodotto</Text>
              </View>

              <View className="space-y-2">
                <View className="flex-row justify-between">
                  <Text className="text-sm text-gray-600">QR Code:</Text>
                  <Text className="text-sm font-semibold text-gray-900 font-mono">{product.qr_code}</Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-sm text-gray-600">Categoria:</Text>
                  <Text className="text-sm font-semibold text-gray-900 capitalize">
                    {product.tipologia_segnale}
                  </Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-sm text-gray-600">Dimensioni:</Text>
                  <Text className="text-sm font-semibold text-gray-900">{product.dimensioni}</Text>
                </View>
                {product.createdAt && (
                  <View className="flex-row justify-between items-center">
                    <Text className="text-sm text-gray-600">Registrato:</Text>
                    <View className="px-2 py-1 rounded-full bg-green-100">
                      <Text className="text-xs font-bold text-green-700">
                        ✓ {formatDate(product.createdAt)}
                      </Text>
                    </View>
                  </View>
                )}
              </View>
            </View>

            <View className="px-6 py-4">
              {/* Sezione 1: Informazioni Principali */}
              <View className="mb-6">
                <View className="flex-row items-center pb-3 mb-4 border-b border-blue-500/20">
                  <View className="w-8 h-8 rounded-lg bg-blue-500/10 items-center justify-center mr-3">
                    <Text className="text-sm font-bold text-blue-500">1</Text>
                  </View>
                  <Text className="text-lg font-semibold text-gray-900">Informazioni Principali</Text>
                </View>

                <View className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                  <View className="flex-row justify-between items-center mb-3">
                    <View className="flex-row items-center">
                      <Ionicons name="flag-outline" size={16} color="#6B7280" />
                      <Text className="text-gray-600 font-medium ml-2">Tipo Segnale:</Text>
                    </View>
                    <Text className="text-blue-800 font-semibold flex-1 text-right" numberOfLines={1}>
                      {product.tipo_segnale}
                    </Text>
                  </View>
                  <View className="flex-row justify-between items-center mb-3">
                    <View className="flex-row items-center">
                      <Ionicons name="resize-outline" size={16} color="#6B7280" />
                      <Text className="text-gray-600 font-medium ml-2">Dimensioni:</Text>
                    </View>
                    <Text className="text-blue-800 font-semibold">{product.dimensioni}</Text>
                  </View>
                  <View className="flex-row justify-between items-center mb-3">
                    <View className="flex-row items-center">
                      <Ionicons name="shapes-outline" size={16} color="#6B7280" />
                      <Text className="text-gray-600 font-medium ml-2">Forma:</Text>
                    </View>
                    <Text className="text-blue-800 font-semibold">{product.forma}</Text>
                  </View>
                  <View className="flex-row justify-between items-center">
                    <View className="flex-row items-center">
                      <Ionicons name="calendar-outline" size={16} color="#6B7280" />
                      <Text className="text-gray-600 font-medium ml-2">Anno Installazione:</Text>
                    </View>
                    <Text className="text-blue-800 font-semibold">{product.anno.toString()}</Text>
                  </View>
                </View>
              </View>

              {/* Sezione 2: Specifiche Tecniche */}
              <View className="mb-6">
                <View className="flex-row items-center pb-3 mb-4 border-b border-orange-500/20">
                  <View className="w-8 h-8 rounded-lg bg-orange-500/10 items-center justify-center mr-3">
                    <Text className="text-sm font-bold text-orange-500">2</Text>
                  </View>
                  <Text className="text-lg font-semibold text-gray-900">Specifiche Tecniche</Text>
                </View>

                <View className="bg-orange-50 p-4 rounded-xl border border-orange-200">
                  <View className="flex-row justify-between items-center mb-3">
                    <View className="flex-row items-center">
                      <Ionicons name="layers-outline" size={16} color="#6B7280" />
                      <Text className="text-gray-600 font-medium ml-2">Materiale Supporto:</Text>
                    </View>
                    <Text className="text-orange-800 font-semibold">{product.materiale_supporto}</Text>
                  </View>
                  <View className="flex-row justify-between items-center mb-3">
                    <View className="flex-row items-center">
                      <Ionicons name="code-working-outline" size={16} color="#6B7280" />
                      <Text className="text-gray-600 font-medium ml-2">Spessore:</Text>
                    </View>
                    <Text className="text-orange-800 font-semibold">{product.spessore_supporto}mm</Text>
                  </View>
                  <View className="flex-row justify-between items-center mb-3">
                    <View className="flex-row items-center">
                      <Ionicons name="color-palette-outline" size={16} color="#6B7280" />
                      <Text className="text-gray-600 font-medium ml-2">Pellicola:</Text>
                    </View>
                    <Text className="text-orange-800 font-semibold">{product.materiale_pellicola || 'N/A'}</Text>
                  </View>
                  <View className="flex-row justify-between items-center">
                    <View className="flex-row items-center">
                      <Ionicons name="construct-outline" size={16} color="#6B7280" />
                      <Text className="text-gray-600 font-medium ml-2">Fissaggio:</Text>
                    </View>
                    <Text className="text-orange-800 font-semibold">{product.fissaggio || 'N/A'}</Text>
                  </View>
                </View>
              </View>

              {/* Sezione 3: Codici Identificativi */}
              <View className="mb-6">
                <View className="flex-row items-center pb-3 mb-4 border-b border-purple-500/20">
                  <View className="w-8 h-8 rounded-lg bg-purple-500/10 items-center justify-center mr-3">
                    <Text className="text-sm font-bold text-purple-500">3</Text>
                  </View>
                  <Text className="text-lg font-semibold text-gray-900">Codici Identificativi</Text>
                </View>

                <View className="bg-purple-50 p-4 rounded-xl border border-purple-200">
                  <View className="flex-row justify-between items-center mb-3">
                    <View className="flex-row items-center">
                      <Ionicons name="qr-code-outline" size={16} color="#6B7280" />
                      <Text className="text-gray-600 font-medium ml-2">QR Code:</Text>
                    </View>
                    <Text className="text-purple-800 font-semibold font-mono">{product.qr_code}</Text>
                  </View>
                  <View className="flex-row justify-between items-center">
                    <View className="flex-row items-center">
                      <Ionicons name="barcode-outline" size={16} color="#6B7280" />
                      <Text className="text-gray-600 font-medium ml-2">Codice WL:</Text>
                    </View>
                    <Text className="text-purple-800 font-semibold font-mono">{product.wl}</Text>
                  </View>
                </View>
              </View>

              {/* Sezione 4: Posizione GPS */}
              {(product.gps_lat && product.gps_lng) && (
                <View className="mb-6">
                  <View className="flex-row items-center pb-3 mb-4 border-b border-green-500/20">
                    <View className="w-8 h-8 rounded-lg bg-green-500/10 items-center justify-center mr-3">
                      <Text className="text-sm font-bold text-green-500">4</Text>
                    </View>
                    <Text className="text-lg font-semibold text-gray-900">Posizione GPS</Text>
                  </View>

                  <View className="bg-green-50 p-4 rounded-xl border border-green-200">
                    <View className="flex-row items-center mb-3">
                      <Ionicons name="location" size={20} color="#059669" />
                      <Text className="text-green-800 font-semibold ml-2 flex-1">
                        {getAddressFromGPS(product.gps_lat, product.gps_lng)}
                      </Text>
                    </View>
                    <View className="bg-white p-3 rounded-lg mb-3">
                      <Text className="text-xs text-gray-600 mb-1">Coordinate GPS:</Text>
                      <Text className="text-green-700 font-mono text-sm">
                        Lat: {product.gps_lat.toFixed(6)}{'\n'}
                        Lng: {product.gps_lng.toFixed(6)}
                      </Text>
                    </View>
                    <TouchableOpacity
                      className="bg-green-600 p-3 rounded-lg flex-row items-center justify-center"
                      activeOpacity={0.7}
                    >
                      <Ionicons name="navigate" size={18} color="white" />
                      <Text className="text-white font-semibold ml-2">Apri Navigatore</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {/* Sezione 5: Note (se disponibili) */}
              {product.note && (
                <View className="mb-6">
                  <View className="flex-row items-center pb-3 mb-4 border-b border-gray-400/20">
                    <View className="w-8 h-8 rounded-lg bg-gray-200 items-center justify-center mr-3">
                      <Text className="text-sm font-bold text-gray-600">5</Text>
                    </View>
                    <Text className="text-lg font-semibold text-gray-900">Note</Text>
                  </View>

                  <View className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                    <Text className="text-gray-700 leading-5">{product.note}</Text>
                  </View>
                </View>
              )}

              {/* Sezione 6: Documentazione Fotografica */}
              <View className="mb-6">
                <View className="flex-row items-center pb-3 mb-4 border-b border-gray-400/20">
                  <View className="w-8 h-8 rounded-lg bg-gray-200 items-center justify-center mr-3">
                    <Text className="text-sm font-bold text-gray-600">{product.note ? '6' : '5'}</Text>
                  </View>
                  <Text className="text-lg font-semibold text-gray-900">Documentazione Fotografica</Text>
                </View>

                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View className="flex-row gap-3">
                    {getProductImages(product.qr_code).map((imageUrl, index) => (
                      <View key={index} className="relative">
                        <View className="w-32 h-24 rounded-xl overflow-hidden bg-gray-200 border border-gray-300">
                          <Image
                            source={{ uri: imageUrl }}
                            className="w-full h-full"
                            resizeMode="cover"
                          />
                        </View>
                        <View className="absolute bottom-1 right-1 bg-black/60 px-2 py-1 rounded">
                          <Text className="text-white text-xs font-medium">{index + 1}/3</Text>
                        </View>
                      </View>
                    ))}
                  </View>
                </ScrollView>

                <Text className="text-xs text-gray-500 mt-3">
                  📸 Foto del segnale stradale in diverse angolazioni
                </Text>
              </View>

              {/* Sezione 7: Info Sistema (se disponibili) */}
              {(product.createdAt || product.updatedAt) && (
                <View className="mb-6">
                  <View className="flex-row items-center pb-3 mb-4 border-b border-gray-400/20">
                    <View className="w-8 h-8 rounded-lg bg-gray-200 items-center justify-center mr-3">
                      <Text className="text-sm font-bold text-gray-600">
                        {product.note ? '7' : '6'}
                      </Text>
                    </View>
                    <Text className="text-lg font-semibold text-gray-900">Info Sistema</Text>
                  </View>

                  <View className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-3">
                    {product.createdAt && (
                      <View className="flex-row justify-between items-center">
                        <View className="flex-row items-center">
                          <Ionicons name="calendar-outline" size={16} color="#6B7280" />
                          <Text className="text-gray-600 font-medium ml-2">Registrato il:</Text>
                        </View>
                        <Text className="text-gray-800 font-semibold">
                          {formatDate(product.createdAt)}
                        </Text>
                      </View>
                    )}
                    {product.updatedAt && (
                      <View className="flex-row justify-between items-center">
                        <View className="flex-row items-center">
                          <Ionicons name="time-outline" size={16} color="#6B7280" />
                          <Text className="text-gray-600 font-medium ml-2">Ultima modifica:</Text>
                        </View>
                        <Text className="text-gray-800 font-semibold">
                          {formatDate(product.updatedAt)}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              )}
            </View>
          </ScrollView>

          {/* Footer */}
          <View className="p-5 border-t border-gray-200 bg-white">
            <TouchableOpacity
              className="bg-blue-500 p-4 rounded-xl flex-row items-center justify-center"
              onPress={handleNavigateToProduct}
              activeOpacity={0.7}
            >
              <Ionicons name="arrow-forward-circle" size={20} color="white" />
              <Text className="text-white font-semibold text-base ml-2">
                Vedi Dettagli
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
});

ProductViewModal.displayName = 'ProductViewModal';

export default ProductViewModal;
