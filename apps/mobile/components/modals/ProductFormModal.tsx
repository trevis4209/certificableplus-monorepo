// Componente form per creazione/modifica prodotti
// Form completo con validazione e gestione errori

import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  ActivityIndicator,
  Image,
  Dimensions
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { ProductFormProps, ProductFormState } from '../../types/scanner';
import { useProductForm } from '../../hooks/scanner/useProductForm';
import { useLocationService } from '../../hooks/scanner/useLocationService';

const { width: screenWidth } = Dimensions.get('window');

const ProductFormModal: React.FC<ProductFormProps> = React.memo(({
  visible,
  scannedQR,
  selectedOperation,
  onClose,
  onSubmit,
}) => {
  const {
    formState,
    updateField,
    updateGPS,
    validateForm,
    validateField,
    resetForm,
    submitForm,
    isDirty,
    formConfig,
  } = useProductForm();

  const { getCurrentLocation, isLoading: isLocationLoading } = useLocationService();

  // State per le immagini
  const [selectedImages, setSelectedImages] = useState<string[]>([]);

  // Handler per la chiusura del modal
  const handleClose = useCallback(() => {
    if (isDirty) {
      Alert.alert(
        'Attenzione',
        'Hai modifiche non salvate. Vuoi uscire senza salvare?',
        [
          { text: 'Annulla', style: 'cancel' },
          { text: 'Esci senza salvare', style: 'destructive', onPress: () => {
            resetForm();
            onClose();
          }}
        ]
      );
    } else {
      onClose();
    }
  }, [isDirty, resetForm, onClose]);

  // Handler per l'ottenimento della posizione GPS
  const handleGetLocation = useCallback(async () => {
    try {
      const { lat, lng } = await getCurrentLocation();
      updateGPS(lat, lng);
    } catch (error) {
      // Gli errori sono già gestiti nel hook useLocationService
      console.log('Errore GPS gestito nel hook');
    }
  }, [getCurrentLocation, updateGPS]);

  // Handler per la selezione delle immagini
  const handleImageSelection = useCallback(() => {
    Alert.alert(
      'Seleziona Immagine',
      'Scegli come aggiungere una foto',
      [
        { text: 'Annulla', style: 'cancel' },
        { text: 'Fotocamera', onPress: () => openCamera() },
        { text: 'Galleria', onPress: () => openImagePicker() }
      ]
    );
  }, []);

  // Apri fotocamera
  const openCamera = useCallback(async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Errore', 'Permesso fotocamera necessario per scattare foto');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setSelectedImages(prev => [...prev, result.assets[0].uri]);
    }
  }, []);

  // Apri galleria
  const openImagePicker = useCallback(async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Errore', 'Permesso galleria necessario per selezionare foto');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setSelectedImages(prev => [...prev, result.assets[0].uri]);
    }
  }, []);

  // Rimuovi immagine
  const removeImage = useCallback((index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
  }, []);

  // Handler per il submit del form
  const handleSubmit = useCallback(async () => {
    const validation = validateForm();
    if (!validation.isValid) {
      const firstError = Object.entries(validation.errors)[0];
      if (firstError) {
        Alert.alert('Errore di Validazione', firstError[1]);
      }
      return;
    }

    try {
      const productData = await submitForm(scannedQR);
      onSubmit(productData);
      resetForm();
    } catch (error) {
      console.error('Errore nel submit del form:', error);
    }
  }, [validateForm, submitForm, scannedQR, onSubmit, resetForm]);

  // Renderizza i pulsanti per la selezione multipla
  const renderMultiSelectButtons = useCallback((
    options: string[],
    currentValue: string,
    onSelect: (value: string) => void,
    colorScheme: string
  ) => (
    <View className="flex-row flex-wrap gap-2 mb-4">
      {options.map((option) => (
        <TouchableOpacity
          key={option}
          onPress={() => onSelect(option)}
          className={`px-4 py-2 rounded-full border ${
            currentValue === option
              ? `border-${colorScheme}-500 bg-${colorScheme}-100`
              : 'border-gray-300 bg-white'
          }`}
        >
          <Text className={`font-medium ${
            currentValue === option 
              ? `text-${colorScheme}-800` 
              : 'text-gray-700'
          }`}>
            {option}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  ), []);

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={handleClose}
    >
      <View className="flex-1 bg-black/50 justify-center items-center px-5">
        <View
          className="bg-white rounded-2xl shadow-2xl relative"
          style={{
            width: Math.min(screenWidth - 40, 400),
            maxHeight: '95%',
            minHeight: 650,
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          {/* Header */}
          <View className="flex-row justify-between items-center p-5 border-b border-gray-100">
            <Text className="text-xl font-semibold text-gray-800">Crea Nuovo Prodotto</Text>
            <TouchableOpacity onPress={handleClose} className="p-1">
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          {/* Scrollable Content */}
          <View style={{ flex: 1 }}>
            <ScrollView
              showsVerticalScrollIndicator={true}
              contentContainerStyle={{
                flexGrow: 1,
                paddingBottom: 100 // Spazio per il footer button
              }}
              style={{ flex: 1 }}
            >
              {/* Product Info */}
              <View className="p-5 border-b border-gray-100">
                <View className="flex-row justify-between items-center mb-2">
                  <Text className="text-sm text-gray-600 font-medium">QR Code:</Text>
                  <Text className="text-sm text-gray-800 font-semibold flex-1 text-right">{scannedQR}</Text>
                </View>
                <Text className="text-xs text-gray-500 italic">Completa tutte le informazioni per registrare il nuovo prodotto</Text>
              </View>

              {/* Informazioni Generali */}
              <View className="p-5">
                <Text className="text-gray-800 text-lg font-semibold mb-4">Informazioni Generali</Text>
              <FormField
                label="Tipo Segnale*"
                value={formState.productName}
                onChangeText={(value) => updateField('productName', value)}
                placeholder="Es. Segnale di pericolo, Segnale di divieto..."
                error={validateField('productName', formState.productName)}
              />

              <View>
                <Text className="text-gray-800 text-base font-semibold mb-2">Forma*</Text>
                {renderMultiSelectButtons(
                  formConfig.shapes,
                  formState.productType,
                  (value) => updateField('productType', value),
                  'blue'
                )}
              </View>

              <FormField
                label="Anno*"
                value={formState.anno}
                onChangeText={(value) => updateField('anno', value)}
                placeholder="2024"
                keyboardType="numeric"
                error={validateField('anno', formState.anno)}
              />

                <FormField
                  label="Codice WL*"
                  value={formState.wl}
                  onChangeText={(value) => updateField('wl', value.toUpperCase())}
                  placeholder="Es. WL001"
                  autoCapitalize="characters"
                  error={validateField('wl', formState.wl)}
                />
              </View>

              {/* Materiali e Specifiche */}
              <View className="p-5 border-t border-gray-100">
                <Text className="text-gray-800 text-lg font-semibold mb-4">Materiali e Specifiche</Text>
              <View>
                <Text className="text-gray-800 text-base font-semibold mb-2">Materiale Supporto*</Text>
                {renderMultiSelectButtons(
                  formConfig.materials,
                  formState.materialeSupporto,
                  (value) => updateField('materialeSupporto', value),
                  'orange'
                )}
              </View>

              <FormField
                label="Spessore Supporto (mm)"
                value={formState.spessoreSupporto}
                onChangeText={(value) => updateField('spessoreSupporto', value)}
                placeholder="2.0"
                keyboardType="decimal-pad"
                error={validateField('spessoreSupporto', formState.spessoreSupporto)}
              />

              <FormField
                label="Dimensioni*"
                value={formState.dimensioni}
                onChangeText={(value) => updateField('dimensioni', value)}
                placeholder="Es. 60x60cm, 90x90cm"
                error={validateField('dimensioni', formState.dimensioni)}
              />

              <View>
                <Text className="text-gray-800 text-base font-semibold mb-2">Materiale Pellicola*</Text>
                {renderMultiSelectButtons(
                  formConfig.filmClasses,
                  formState.materialePellicola,
                  (value) => updateField('materialePellicola', value),
                  'orange'
                )}
              </View>
              </View>

              {/* Posizione GPS */}
              <View className="p-5 border-t border-gray-100">
                <Text className="text-gray-800 text-lg font-semibold mb-4">Posizione GPS</Text>
              <View>
                <Text className="text-gray-800 text-base font-semibold mb-2">Tipo Fissaggio*</Text>
                {renderMultiSelectButtons(
                  formConfig.fixingTypes,
                  formState.fissaggio,
                  (value) => updateField('fissaggio', value),
                  'green'
                )}
              </View>

              <TouchableOpacity
                onPress={handleGetLocation}
                disabled={isLocationLoading}
                className={`flex-row items-center justify-center p-3 rounded-xl mb-3 ${
                  isLocationLoading ? 'bg-gray-300' : 'bg-blue-500'
                }`}
              >
                {isLocationLoading ? (
                  <ActivityIndicator size="small" color="white" style={{ marginRight: 8 }} />
                ) : (
                  <Ionicons name="location" size={20} color="white" style={{ marginRight: 8 }} />
                )}
                <Text className="text-white font-semibold">
                  {isLocationLoading ? 'Ottenendo posizione...' : 'Usa Posizione Attuale'}
                </Text>
              </TouchableOpacity>

              <View className="flex-row gap-2 mb-2">
                <FormField
                  label="Latitudine"
                  value={formState.gpsLat}
                  onChangeText={(value) => updateField('gpsLat', value)}
                  placeholder="Latitudine"
                  keyboardType="decimal-pad"
                  containerClassName="flex-1"
                  error={validateField('gpsLat', formState.gpsLat)}
                />
                <FormField
                  label="Longitudine"
                  value={formState.gpsLng}
                  onChangeText={(value) => updateField('gpsLng', value)}
                  placeholder="Longitudine"
                  keyboardType="decimal-pad"
                  containerClassName="flex-1"
                  error={validateField('gpsLng', formState.gpsLng)}
                />
              </View>

              {(formState.gpsLat || formState.gpsLng) && (
                <View className="bg-green-50 p-3 rounded-lg mt-2">
                  <Text className="text-green-800 text-sm">
                    📍 Coordinate: {formState.gpsLat ? parseFloat(formState.gpsLat).toFixed(6) : '0'}, {formState.gpsLng ? parseFloat(formState.gpsLng).toFixed(6) : '0'}
                  </Text>
                </View>
              )}
              </View>

              {/* Immagini */}
              <View className="p-5 border-t border-gray-100">
                <Text className="text-gray-800 text-lg font-semibold mb-4">Foto del Segnale</Text>
              {/* Pulsante per aggiungere foto */}
              <TouchableOpacity
                onPress={handleImageSelection}
                className="bg-blue-50 border-2 border-dashed border-blue-300 p-6 rounded-xl flex-row items-center justify-center mb-4"
              >
                <Ionicons name="camera-outline" size={24} color="#3B82F6" style={{ marginRight: 8 }} />
                <Text className="text-blue-600 font-semibold text-lg">Aggiungi Foto</Text>
              </TouchableOpacity>

              {/* Galleria immagini selezionate */}
              {selectedImages.length > 0 && (
                <View>
                  <Text className="text-gray-800 text-base font-semibold mb-3">
                    Foto Selezionate ({selectedImages.length})
                  </Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View className="flex-row gap-3">
                      {selectedImages.map((imageUri, index) => (
                        <View key={index} className="relative">
                          <Image
                            source={{ uri: imageUri }}
                            style={{ width: 120, height: 90 }}
                            className="rounded-xl bg-gray-200"
                            resizeMode="cover"
                          />
                          <TouchableOpacity
                            onPress={() => removeImage(index)}
                            className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1"
                          >
                            <Ionicons name="close" size={16} color="white" />
                          </TouchableOpacity>
                        </View>
                      ))}
                    </View>
                  </ScrollView>
                </View>
              )}
              </View>

              {/* Note */}
              <View className="p-5 border-t border-gray-100">
                <Text className="text-gray-800 text-lg font-semibold mb-4">Note</Text>
                <FormField
                  label="Note e Osservazioni"
                  value={formState.notes}
                  onChangeText={(value) => updateField('notes', value)}
                  placeholder="Descrivere posizione esatta, stato del segnale, condizioni particolari..."
                  multiline
                  numberOfLines={3}
                />
              </View>

            </ScrollView>
          </View>

          {/* Fixed Footer Button - Positioned absolutely */}
          <View
            className="absolute bottom-0 left-0 right-0 p-5 border-t border-gray-200 bg-white rounded-b-2xl"
            style={{
              backgroundColor: 'white',
              borderBottomLeftRadius: 16,
              borderBottomRightRadius: 16
            }}
          >
            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={handleClose}
                className="flex-1 bg-gray-500 p-4 rounded-xl"
                activeOpacity={0.8}
              >
                <View className="flex-row items-center justify-center">
                  <Ionicons name="close-circle" size={20} color="white" style={{ marginRight: 8 }} />
                  <Text className="text-white font-semibold text-center text-lg">
                    Annulla
                  </Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleSubmit}
                className="flex-1 bg-green-500 p-4 rounded-xl"
                activeOpacity={0.8}
              >
                <View className="flex-row items-center justify-center">
                  <Ionicons name="checkmark-circle" size={20} color="white" style={{ marginRight: 8 }} />
                  <Text className="text-white font-semibold text-center text-lg">
                    Crea Prodotto
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
});


// Componente helper per i campi del form
const FormField: React.FC<{
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  keyboardType?: 'default' | 'numeric' | 'decimal-pad' | 'url';
  multiline?: boolean;
  numberOfLines?: number;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  containerClassName?: string;
  error?: string | null;
}> = React.memo(({ 
  label, 
  value, 
  onChangeText, 
  placeholder, 
  keyboardType = 'default',
  multiline = false,
  numberOfLines = 1,
  autoCapitalize = 'sentences',
  containerClassName,
  error
}) => (
  <View className={containerClassName || 'mb-4'}>
    <Text className="text-gray-800 text-base font-semibold mb-2">{label}</Text>
    <TextInput
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      keyboardType={keyboardType}
      multiline={multiline}
      numberOfLines={numberOfLines}
      autoCapitalize={autoCapitalize}
      className={`border rounded-xl p-3 text-gray-800 ${
        error ? 'border-red-500 bg-red-50' : 'border-gray-300'
      } ${multiline ? '' : 'h-12'}`}
      textAlignVertical={multiline ? 'top' : 'center'}
    />
    {error && (
      <Text className="text-red-500 text-sm mt-1">{error}</Text>
    )}
  </View>
));

ProductFormModal.displayName = 'ProductFormModal';
FormField.displayName = 'FormField';

export default ProductFormModal;