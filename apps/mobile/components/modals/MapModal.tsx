/**
 * MapModal Component - Full-Screen Interactive Map Modal
 *
 * **Core Features:**
 * - Full-screen modal with interactive map
 * - Product location marker with custom styling
 * - Open in external maps app (Google Maps / Apple Maps)
 * - Clean, mobile-optimized UI
 *
 * **Design Principles:**
 * - Mobile-first responsive design
 * - Clear visual hierarchy
 * - Easy-to-use action buttons
 * - Optimized for map interactions
 *
 * **Technical Architecture:**
 * - React Native Modal component
 * - react-native-maps for map rendering
 * - Platform-aware external navigation
 * - Type-safe props interface
 *
 * **Integration Points:**
 * - Product detail pages
 * - Any component needing location visualization
 */

import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  Alert,
  Linking,
  Platform,
  StyleSheet,
  Pressable
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import type { Product } from '@certplus/types';

interface MapModalProps {
  /**
   * Controls modal visibility
   */
  visible: boolean;

  /**
   * Callback when modal should close
   */
  onClose: () => void;

  /**
   * Product data with GPS coordinates
   */
  product: Product;
}

/**
 * MapModal Component
 * Displays product location on an interactive map
 */
const MapModal: React.FC<MapModalProps> = ({
  visible,
  onClose,
  product
}) => {
  /**
   * Open location in external maps app
   * Platform-aware: Apple Maps (iOS) / Google Maps (Android)
   */
  const handleOpenInMaps = async () => {
    if (!product?.gps_lat || !product?.gps_lng) {
      Alert.alert('Errore', 'Coordinate GPS non disponibili');
      return;
    }

    const lat = typeof product.gps_lat === 'string' ? parseFloat(product.gps_lat) : product.gps_lat;
    const lng = typeof product.gps_lng === 'string' ? parseFloat(product.gps_lng) : product.gps_lng;

    const label = encodeURIComponent(product.tipo_segnale);
    const url = Platform.select({
      ios: `maps:0,0?q=${label}@${lat},${lng}`,
      android: `geo:0,0?q=${lat},${lng}(${label})`
    });

    try {
      if (url) {
        const supported = await Linking.canOpenURL(url);
        if (supported) {
          await Linking.openURL(url);
        } else {
          // Fallback to Google Maps web
          const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
          await Linking.openURL(googleMapsUrl);
        }
      }
    } catch (error) {
      Alert.alert('Errore', 'Impossibile aprire la mappa. Verifica la connessione internet.');
      console.error('Error opening maps:', error);
    }
  };

  /**
   * Format GPS coordinates with proper precision
   */
  const formatGPS = (coord: number | string | undefined): string => {
    if (coord === undefined || coord === null) return 'N/A';
    const num = typeof coord === 'string' ? parseFloat(coord) : coord;
    return isNaN(num) ? 'N/A' : num.toFixed(6);
  };

  // Get coordinates
  const latitude = typeof product.gps_lat === 'string' ? parseFloat(product.gps_lat) : product.gps_lat;
  const longitude = typeof product.gps_lng === 'string' ? parseFloat(product.gps_lng) : product.gps_lng;

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/60 justify-center items-center px-6">
        {/* Backdrop - Tap to close */}
        <Pressable
          onPress={onClose}
          style={StyleSheet.absoluteFillObject}
        />

        {/* Modal Content */}
        <View className="w-full max-w-md" style={{ zIndex: 10 }}>
          <View className="bg-white rounded-3xl shadow-2xl overflow-hidden">
            {/* Header */}
            <View className="bg-blue-500 px-6 py-5">
              <View className="flex-row items-center justify-between mb-3">
                <View className="flex-row items-center flex-1">
                  <View className="bg-white/20 p-2.5 rounded-full mr-3">
                    <Ionicons name="location" size={22} color="white" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-white font-bold text-lg">Posizione Prodotto</Text>
                  </View>
                </View>
                <TouchableOpacity
                  onPress={onClose}
                  className="bg-white/20 p-2 rounded-full"
                  activeOpacity={0.7}
                >
                  <Ionicons name="close" size={20} color="white" />
                </TouchableOpacity>
              </View>

              {/* Product Info in Header */}
              <View className="bg-white/10 rounded-lg px-3 py-2">
                <Text className="text-white font-semibold text-sm" numberOfLines={1}>
                  {product.tipo_segnale}
                </Text>
                <Text className="text-white/80 text-xs font-mono mt-1">
                  📍 {formatGPS(product.gps_lat)}, {formatGPS(product.gps_lng)}
                </Text>
              </View>
            </View>

            {/* Map View */}
            <View style={{ height: 450 }} className="bg-gray-100">
              {latitude && longitude && !isNaN(latitude) && !isNaN(longitude) ? (
                <MapView
                  style={StyleSheet.absoluteFillObject}
                  provider={PROVIDER_GOOGLE}
                  initialRegion={{
                    latitude,
                    longitude,
                    latitudeDelta: 0.005,
                    longitudeDelta: 0.005,
                  }}
                  mapType="standard"
                  showsUserLocation={true}
                  showsMyLocationButton={false}
                  showsCompass={true}
                  scrollEnabled={true}
                  zoomEnabled={true}
                  pitchEnabled={true}
                  rotateEnabled={true}
                >
                  <Marker
                    coordinate={{
                      latitude,
                      longitude,
                    }}
                    title={product.tipo_segnale}
                    description={`${product.forma} - ${product.dimensioni}`}
                  >
                    <View style={{ alignItems: 'center' }}>
                      {/* Pin shadow */}
                      <View
                        style={{
                          width: 50,
                          height: 50,
                          borderRadius: 25,
                          backgroundColor: 'rgba(59, 130, 246, 0.2)',
                          position: 'absolute',
                          top: 0,
                        }}
                      />
                      {/* Main pin body */}
                      <View
                        style={{
                          width: 44,
                          height: 44,
                          borderRadius: 22,
                          backgroundColor: '#3B82F6',
                          justifyContent: 'center',
                          alignItems: 'center',
                          borderWidth: 3,
                          borderColor: '#ffffff',
                          shadowColor: '#000',
                          shadowOffset: { width: 0, height: 4 },
                          shadowOpacity: 0.3,
                          shadowRadius: 8,
                          elevation: 8,
                        }}
                      >
                        <Ionicons name="location-sharp" size={26} color="white" />
                      </View>
                      {/* Pin tail */}
                      <View
                        style={{
                          width: 0,
                          height: 0,
                          borderLeftWidth: 10,
                          borderRightWidth: 10,
                          borderTopWidth: 15,
                          borderLeftColor: 'transparent',
                          borderRightColor: 'transparent',
                          borderTopColor: '#3B82F6',
                          marginTop: -3,
                        }}
                      />
                    </View>
                  </Marker>
                </MapView>
              ) : (
                <View className="flex-1 justify-center items-center bg-gray-50">
                  <View className="bg-gray-200 p-6 rounded-full mb-4">
                    <Ionicons name="map-outline" size={48} color="#9CA3AF" />
                  </View>
                  <Text className="text-gray-600 text-center">
                    Coordinate GPS non disponibili
                  </Text>
                </View>
              )}
            </View>

            {/* Action Buttons */}
            <View className="p-6 bg-gray-50">
              <TouchableOpacity
                onPress={handleOpenInMaps}
                className="bg-blue-500 py-4 rounded-xl flex-row items-center justify-center"
                activeOpacity={0.8}
                style={{
                  shadowColor: '#3B82F6',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.2,
                  shadowRadius: 4,
                  elevation: 3,
                }}
              >
                <Ionicons name="navigate" size={20} color="white" />
                <Text className="text-white font-semibold text-base ml-2">
                  Apri in {Platform.OS === 'ios' ? 'Apple Maps' : 'Google Maps'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default MapModal;
export type { MapModalProps };
