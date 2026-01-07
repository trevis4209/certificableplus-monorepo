/**
 * QRCodeModal Component - QR Code Display Modal for React Native
 *
 * **Core Features:**
 * - Full-screen modal with QR code display
 * - Product information display
 * - Download functionality with expo-sharing
 * - Clean, mobile-optimized UI
 *
 * **Design Principles:**
 * - Mobile-first responsive design
 * - Clear visual hierarchy
 * - Easy-to-use action buttons
 * - Optimized for single-handed operation
 *
 * **Technical Architecture:**
 * - React Native Modal component
 * - View capture with react-native-view-shot
 * - Share functionality with expo-sharing
 * - Type-safe props interface
 *
 * **Integration Points:**
 * - Product detail pages
 * - QRCode component
 * - Product type system
 */

import React, { useRef, useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { captureRef } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import QRCode from '@/components/ui/QRCode';
import type { Product } from '@certplus/types';

interface QRCodeModalProps {
  /**
   * Controls modal visibility
   */
  visible: boolean;

  /**
   * Callback when modal should close
   */
  onClose: () => void;

  /**
   * Product data to display
   */
  product: Product;

  /**
   * Optional company name for display
   */
  companyName?: string;
}

/**
 * QRCodeModal Component
 * Displays product QR code with download functionality
 */
const QRCodeModal: React.FC<QRCodeModalProps> = ({
  visible,
  onClose,
  product,
  companyName
}) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const qrRef = useRef<View>(null);

  /**
   * Handle QR code download/share
   * Captures the QR code view and shares it using expo-sharing
   */
  const handleDownload = async () => {
    if (!qrRef.current) return;

    setIsDownloading(true);

    try {
      // Capture the QR code view as an image
      const uri = await captureRef(qrRef, {
        format: 'png',
        quality: 1.0,
        result: 'tmpfile'
      });

      // Check if sharing is available
      const isAvailable = await Sharing.isAvailableAsync();

      if (!isAvailable) {
        Alert.alert(
          'Errore',
          'La condivisione non è disponibile su questo dispositivo'
        );
        return;
      }

      // Share the captured image
      await Sharing.shareAsync(uri, {
        mimeType: 'image/png',
        dialogTitle: `QR Code - ${product.qr_code}`,
        UTI: 'public.png'
      });

    } catch (error) {
      console.error('Download failed:', error);
      Alert.alert(
        'Errore',
        'Impossibile scaricare il QR code. Riprova.'
      );
    } finally {
      setIsDownloading(false);
    }
  };

  /**
   * Format date to Italian locale
   */
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  /**
   * Format GPS coordinates with proper precision
   */
  const formatGPS = (coord: number | string | undefined): string => {
    if (coord === undefined || coord === null) return 'N/A';
    const num = typeof coord === 'string' ? parseFloat(coord) : coord;
    return isNaN(num) ? 'N/A' : num.toFixed(6);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/50">
        <View className="flex-1 mt-20 bg-white rounded-t-3xl shadow-2xl">
          {/* Header */}
          <View className="px-6 pt-6 pb-4 border-b border-gray-200 bg-gray-50">
            <View className="flex-row items-center justify-between mb-3">
              <View className="flex-row items-center">
                <View className="bg-teal-100 p-2 rounded-full mr-3">
                  <Ionicons name="qr-code" size={20} color="#14b8a6" />
                </View>
                <Text className="text-lg font-bold text-gray-800">QR Code</Text>
              </View>
              <TouchableOpacity
                onPress={onClose}
                className="bg-gray-200 p-2 rounded-full"
              >
                <Ionicons name="close" size={20} color="#374151" />
              </TouchableOpacity>
            </View>

            {/* Product Title */}
            <View className="space-y-2">
              <View className="flex-row items-center flex-wrap gap-2">
                <View className="bg-teal-100 px-3 py-1 rounded-full">
                  <Text className="text-teal-800 font-mono text-xs font-medium">
                    {product.qr_code}
                  </Text>
                </View>
                {companyName && (
                  <View className="bg-gray-200 px-3 py-1 rounded-full flex-row items-center">
                    <Ionicons name="business" size={12} color="#6B7280" />
                    <Text className="text-gray-700 text-xs ml-1">{companyName}</Text>
                  </View>
                )}
              </View>
              <Text className="text-base font-semibold text-gray-800">
                {product.tipo_segnale}
              </Text>
              <Text className="text-sm text-gray-600">
                {product.forma} • {product.dimensioni} • {product.anno}
              </Text>
            </View>
          </View>

          <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
            {/* QR Code Display */}
            <View className="px-6 py-6">
              <View className="items-center mb-6">
                <View
                  ref={qrRef}
                  className="p-4 bg-white rounded-2xl shadow-lg border border-gray-200"
                >
                  <QRCode
                    data={product.qr_code}
                    size={200}
                    errorCorrectionLevel="M"
                    backgroundColor="#ffffff"
                    color="#000000"
                  />
                </View>
              </View>

              {/* Product Details */}
              <View className="space-y-2">
                <View className="flex-row items-center justify-between py-3 px-4 bg-gray-50 rounded-lg">
                  <View className="flex-row items-center">
                    <Ionicons name="cube-outline" size={16} color="#6B7280" />
                    <Text className="text-gray-600 text-sm ml-2">Materiale</Text>
                  </View>
                  <Text className="text-gray-800 text-sm font-medium text-right flex-1 ml-4">
                    {product.materiale_supporto}
                  </Text>
                </View>

                <View className="flex-row items-center justify-between py-3 px-4 bg-gray-50 rounded-lg">
                  <View className="flex-row items-center">
                    <Ionicons name="color-palette-outline" size={16} color="#6B7280" />
                    <Text className="text-gray-600 text-sm ml-2">Pellicola</Text>
                  </View>
                  <Text className="text-gray-800 text-sm font-medium text-right flex-1 ml-4">
                    {product.materiale_pellicola}
                  </Text>
                </View>

                <View className="flex-row items-center justify-between py-3 px-4 bg-gray-50 rounded-lg">
                  <View className="flex-row items-center">
                    <Ionicons name="calendar-outline" size={16} color="#6B7280" />
                    <Text className="text-gray-600 text-sm ml-2">Data Creazione</Text>
                  </View>
                  <Text className="text-gray-800 text-sm font-medium">
                    {formatDate(product.createdAt)}
                  </Text>
                </View>

                {product.gps_lat && product.gps_lng && (
                  <View className="flex-row items-center justify-between py-3 px-4 bg-gray-50 rounded-lg">
                    <View className="flex-row items-center">
                      <Ionicons name="location-outline" size={16} color="#6B7280" />
                      <Text className="text-gray-600 text-sm ml-2">GPS</Text>
                    </View>
                    <Text className="text-gray-800 text-xs font-mono">
                      {formatGPS(product.gps_lat)}, {formatGPS(product.gps_lng)}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </ScrollView>

          {/* Action Buttons */}
          <View className="px-6 pb-6 pt-4 border-t border-gray-200">
            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={handleDownload}
                disabled={isDownloading}
                className="flex-1 bg-teal-500 py-4 rounded-xl flex-row items-center justify-center"
                activeOpacity={0.7}
              >
                {isDownloading ? (
                  <>
                    <ActivityIndicator size="small" color="white" />
                    <Text className="text-white font-semibold ml-2">
                      Scaricando...
                    </Text>
                  </>
                ) : (
                  <>
                    <Ionicons name="download" size={20} color="white" />
                    <Text className="text-white font-semibold ml-2">
                      Scarica
                    </Text>
                  </>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                onPress={onClose}
                className="flex-1 bg-gray-200 py-4 rounded-xl flex-row items-center justify-center"
                activeOpacity={0.7}
              >
                <Ionicons name="close" size={20} color="#374151" />
                <Text className="text-gray-700 font-semibold ml-2">
                  Chiudi
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default QRCodeModal;
export type { QRCodeModalProps };
