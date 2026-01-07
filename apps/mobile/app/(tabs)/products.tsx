import Header from '@/components/layout/Header';
import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useProducts } from '@/hooks/useProducts';
import { useAuth } from '@/contexts/AuthContext';
import { router } from 'expo-router';
import { useState, useCallback, useMemo } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import type { Product } from '@certplus/types';

export default function ProductsPage() {
  const { user } = useAuth();
  const companyId = user?.companyId || 'default-company';

  const [searchQuery, setSearchQuery] = useState('');

  // Fetch real data from backend - GET /product
  const { products, loading, refetch } = useProducts(companyId);

  // Refresh data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch])
  );

  // Filter products based on search query
  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) return products;

    const query = searchQuery.toLowerCase();
    return products.filter(p =>
      p.tipo_segnale.toLowerCase().includes(query) ||
      p.qr_code.toLowerCase().includes(query) ||
      p.wl.toLowerCase().includes(query) ||
      p.forma.toLowerCase().includes(query)
    );
  }, [products, searchQuery]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const handleProductPress = (product: Product) => {
    router.push(`/pages/product/${product.id}` as any);
  };

  return (
    <View className="flex-1 bg-gray-50">
      {/* Fixed Header */}
      <Header
        title="Prodotti"
        subtitle="Gestire segnali e dispositivi"
      />

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>

      {/* Loading State */}
      {loading && (
        <View className="flex-1 items-center justify-center py-20">
          <ActivityIndicator size="large" color="#0891b2" />
          <Text className="text-gray-600 mt-4">Caricamento prodotti...</Text>
        </View>
      )}

      {!loading && (
        <>
        {/* Stats Summary */}
        <View className="mx-4 mt-4 mb-4">
          <View className="bg-white rounded-xl shadow-sm p-4">
            <View className="flex-row items-center justify-between">
              <View className="flex-1">
                <Text className="text-gray-600 text-sm">Totale Prodotti</Text>
                <Text className="text-3xl font-bold text-teal-600 mt-1">{products.length}</Text>
              </View>
              <View className="bg-teal-100 p-4 rounded-full">
                <Ionicons name="cube" size={32} color="#0891b2" />
              </View>
            </View>
          </View>
        </View>

        {/* Product Cards */}
        <View className="mx-4 mb-6">
          <Text className="text-gray-800 text-lg font-semibold mb-3">
            Tutti i Prodotti
            <Text className="text-gray-500 font-normal text-base"> ({filteredProducts.length})</Text>
          </Text>

          {filteredProducts.length === 0 ? (
            <View className="bg-white p-8 rounded-xl shadow-sm items-center">
              <Ionicons name="cube-outline" size={48} color="#9CA3AF" />
              <Text className="text-gray-500 mt-3 text-center">
                Nessun prodotto trovato
              </Text>
            </View>
          ) : (
            <View className="space-y-3 gap-2">
              {filteredProducts.map((product) => (
                <TouchableOpacity
                  key={product.id}
                  className="bg-white p-4 rounded-xl shadow-sm"
                  onPress={() => handleProductPress(product)}
                >
                  <View className="flex-row items-start">
                    <View className="bg-teal-500 p-3 rounded-full mr-3 mt-1">
                      <Ionicons name="cube" size={20} color="white" />
                    </View>
                    <View className="flex-1">
                      <View className="flex-row items-center justify-between mb-2">
                        <Text className="text-gray-800 font-bold text-base" numberOfLines={1}>
                          {product.tipo_segnale}
                        </Text>
                        <View className="bg-teal-100 px-2 py-1 rounded-full">
                          <Text className="text-teal-700 text-xs font-semibold">
                            {product.forma}
                          </Text>
                        </View>
                      </View>

                      <Text className="text-gray-600 text-sm mb-2">
                        WL: {product.wl || 'N/A'} • Anno: {product.anno}
                      </Text>

                      <View className="flex-row items-center justify-between">
                        <View className="flex-row items-center">
                          <Ionicons name="qr-code-outline" size={14} color="#6B7280" />
                          <Text className="text-gray-500 text-xs ml-1 font-mono">
                            {product.qr_code}
                          </Text>
                        </View>

                        <View className="flex-row items-center">
                          <Ionicons name="calendar-outline" size={14} color="#6B7280" />
                          <Text className="text-gray-500 text-xs ml-1">
                            {formatDate(product.createdAt)}
                          </Text>
                        </View>
                      </View>

                      {/* Additional info */}
                      <View className="mt-2 pt-2 border-t border-gray-100">
                        <View className="flex-row items-center justify-between">
                          <Text className="text-gray-500 text-xs">
                            {product.dimensioni} • {product.materiale_supporto}
                          </Text>
                          {product.asset_id && (
                            <View className="flex-row items-center bg-purple-50 px-2 py-1 rounded">
                              <Ionicons name="cube-outline" size={10} color="#7C3AED" />
                              <Text className="text-purple-600 text-xs ml-1 font-medium">
                                Blockchain
                              </Text>
                            </View>
                          )}
                        </View>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
        </>
      )}
      </ScrollView>
    </View>
  );
}
