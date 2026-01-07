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
  Alert,
  Pressable
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
          style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
        />

        {/* Modal Content */}
        <View className="w-full max-w-md" style={{ zIndex: 10 }}>
          <View className="bg-white rounded-3xl shadow-2xl overflow-hidden">
            {/* Header */}
            <View className="bg-teal-500 px-6 py-5">
              <View className="flex-row items-center justify-between mb-3">
                <View className="flex-row items-center flex-1">
                  <View className="bg-white/20 p-2.5 rounded-full mr-3">
                    <Ionicons name="qr-code" size={22} color="white" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-white font-bold text-lg">QR Code Prodotto</Text>
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
                <View className="flex-row items-center flex-wrap gap-2 mb-2">
                  <Text className="text-white font-mono text-xs font-semibold">
                    📱 {product.qr_code}
                  </Text>
                  {companyName && (
                    <>
                      <Text className="text-white/60 text-xs">•</Text>
                      <Text className="text-white/80 text-xs">{companyName}</Text>
                    </>
                  )}
                </View>
                <Text className="text-white font-semibold text-sm" numberOfLines={1}>
                  {product.tipo_segnale}
                </Text>
                <Text className="text-white/80 text-xs mt-1">
                  {product.forma} • {product.dimensioni} • {product.anno}
                </Text>
              </View>
            </View>

          <ScrollView
            style={{ maxHeight: 500 }}
            showsVerticalScrollIndicator={true}
            contentContainerStyle={{ paddingBottom: 8 }}
          >
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
              </View>
            </View>
          </ScrollView>

          {/* Action Buttons */}
          <View className="p-6 bg-gray-50">
            <TouchableOpacity
              onPress={handleDownload}
              disabled={isDownloading}
              className="bg-teal-500 py-4 rounded-xl flex-row items-center justify-center"
              activeOpacity={0.8}
              style={{
                shadowColor: '#14B8A6',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.2,
                shadowRadius: 4,
                elevation: 3,
              }}
            >
              {isDownloading ? (
                <>
                  <ActivityIndicator size="small" color="white" />
                  <Text className="text-white font-semibold text-base ml-2">
                    Scaricando...
                  </Text>
                </>
              ) : (
                <>
                  <Ionicons name="download" size={20} color="white" />
                  <Text className="text-white font-semibold text-base ml-2">
                    Scarica e Condividi
                  </Text>
                </>
              )}
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
