// Modal per creazione/modifica interventi di manutenzione
// Adattato per scanner con rilevamento automatico prodotto
// UI identica alla versione web con sezioni numerate

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  Modal,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Dimensions,
  Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { Product } from '@certplus/types';
import { useMaintenancesByProduct } from '@/hooks/useMaintenance';
import { useAuth } from '@/contexts/AuthContext';
import { backendAPI } from '@/lib/api/backend';
import { mapMaintenanceToCreateRequest } from '@/lib/api/mappers';

interface MaintenanceOptionsModalProps {
  visible: boolean;
  product: Product | null;
  onClose: () => void;
  onSelectOption: (optionId: string) => void;
  onSuccess?: () => void;
  allowedActions?: string[];
  title?: string;
  subtitle?: string;
}

interface InterventionType {
  value: string;
  apiValue: string;
  label: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  fields: ('year' | 'gps' | 'poles_number' | 'reason' | 'notes' | 'foto')[];
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Tipi di intervento disponibili
const interventionTypes: InterventionType[] = [
  {
    value: 'installazione',
    apiValue: 'installation',
    label: 'Installazione',
    description: 'Prima installazione del prodotto con specifiche complete',
    icon: 'construct',
    color: '#32D74B',
    fields: ['year', 'gps', 'poles_number', 'reason', 'notes', 'foto']
  },
  {
    value: 'manutenzione',
    apiValue: 'maintenance',
    label: 'Manutenzione',
    description: 'Controllo e manutenzione ordinaria',
    icon: 'build',
    color: '#007AFF',
    fields: ['gps', 'reason', 'notes', 'foto']
  },
  {
    value: 'sostituzione',
    apiValue: 'replacement',
    label: 'Sostituzione',
    description: 'Sostituzione completa del segnale',
    icon: 'swap-horizontal',
    color: '#FF9500',
    fields: ['year', 'gps', 'reason', 'notes', 'foto']
  },
  {
    value: 'verifica',
    apiValue: 'verification',
    label: 'Verifica',
    description: 'Controllo visivo e verifica stato conformità',
    icon: 'search',
    color: '#5856D6',
    fields: ['year', 'gps', 'reason', 'notes', 'foto']
  },
  {
    value: 'dismissione',
    apiValue: 'dismissal',
    label: 'Dismissione',
    description: 'Rimozione definitiva del prodotto dal servizio',
    icon: 'trash',
    color: '#FF3B30',
    fields: ['year', 'gps', 'reason', 'notes', 'foto']
  }
];

export default function MaintenanceOptionsModal({
  visible,
  product,
  onClose,
  onSelectOption,
  onSuccess,
  title = 'Nuovo Intervento',
  subtitle
}: MaintenanceOptionsModalProps) {
  const { user } = useAuth();
  const userId = user?.id || 'default-user';
  const companyId = user?.companyId || '1';

  // Fetch maintenances to check installation status
  const { maintenances } = useMaintenancesByProduct(product?.id || null, userId);
  const isInstalled = maintenances.some(m => m.tipo_intervento === 'installazione');

  // Form state
  const [selectedIntervention, setSelectedIntervention] = useState<InterventionType | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);

  // Form fields
  const [notes, setNotes] = useState('');
  const [reason, setReason] = useState('');
  const [certificateNumber, setCertificateNumber] = useState('');
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [polesNumber, setPolesNumber] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);

  // GPS state
  const [gpsLocation, setGpsLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isLoadingGPS, setIsLoadingGPS] = useState(false);

  // UI state
  const [isSaving, setIsSaving] = useState(false);

  // Auto-select installation if product not installed
  useEffect(() => {
    if (visible && !isInstalled) {
      const installationType = interventionTypes.find(t => t.value === 'installazione');
      setSelectedIntervention(installationType || null);
    }
  }, [visible, isInstalled]);

  // Auto-generate certificate number
  useEffect(() => {
    if (visible && !certificateNumber) {
      const certNumber = `CERT-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`;
      setCertificateNumber(certNumber);
    }
  }, [visible]);

  // Get GPS location when modal opens
  useEffect(() => {
    if (visible && !gpsLocation) {
      getCurrentLocation();
    }
  }, [visible]);

  // Reset form when modal closes
  useEffect(() => {
    if (!visible) {
      setSelectedIntervention(null);
      setShowDropdown(false);
      setNotes('');
      setReason('');
      setCertificateNumber('');
      setYear(new Date().getFullYear().toString());
      setPolesNumber('');
      setPhotos([]);
      setGpsLocation(null);
    }
  }, [visible]);

  // Get GPS location
  const getCurrentLocation = async () => {
    setIsLoadingGPS(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Errore', 'Permesso GPS negato. L\'intervento richiede la posizione GPS.');
        setIsLoadingGPS(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High
      });

      const lat = parseFloat(location.coords.latitude.toFixed(6));
      const lng = parseFloat(location.coords.longitude.toFixed(6));

      // Validate GPS coordinates
      if (!backendAPI.validateGPSCoordinates(lat, lng)) {
        Alert.alert('Errore GPS', 'Coordinate GPS non valide per il backend (max 6 decimali, 9 cifre totali)');
        setIsLoadingGPS(false);
        return;
      }

      setGpsLocation({ lat, lng });
    } catch (error) {
      console.error('Error getting GPS location:', error);
      Alert.alert('Errore GPS', 'Impossibile ottenere la posizione GPS. Riprova.');
    } finally {
      setIsLoadingGPS(false);
    }
  };

  // Pick image from library or camera
  const pickImage = async () => {
    // Request permissions
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permesso negato', 'Abbiamo bisogno del permesso per accedere alla galleria.');
      return;
    }

    Alert.alert(
      'Seleziona Sorgente',
      'Scegli da dove caricare la foto',
      [
        {
          text: 'Camera',
          onPress: async () => {
            const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
            if (cameraStatus !== 'granted') {
              Alert.alert('Permesso negato', 'Abbiamo bisogno del permesso per accedere alla fotocamera.');
              return;
            }

            const result = await ImagePicker.launchCameraAsync({
              mediaTypes: 'images',
              allowsEditing: true,
              aspect: [4, 3],
              quality: 0.8,
            });

            if (!result.canceled && result.assets[0]) {
              setPhotos(prev => [...prev, result.assets[0].uri]);
            }
          }
        },
        {
          text: 'Galleria',
          onPress: async () => {
            const result = await ImagePicker.launchImageLibraryAsync({
              mediaTypes: 'images',
              allowsMultipleSelection: true,
              aspect: [4, 3],
              quality: 0.8,
            });

            if (!result.canceled) {
              const uris = result.assets.map(asset => asset.uri);
              setPhotos(prev => [...prev, ...uris]);
            }
          }
        },
        {
          text: 'Annulla',
          style: 'cancel'
        }
      ]
    );
  };

  // Remove photo
  const removePhoto = useCallback((index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  }, []);

  // Available intervention types based on installation status
  const availableInterventions = useMemo(() => {
    if (!product) return [];

    if (isInstalled) {
      // Product installed: all except installation
      return interventionTypes.filter(t => t.value !== 'installazione');
    } else {
      // Product not installed: only installation
      return interventionTypes.filter(t => t.value === 'installazione');
    }
  }, [product, isInstalled]);

  // Form validation (ALIGNED WITH WEB VERSION - simplified)
  const isFormValid = useMemo(() => {
    if (!selectedIntervention || !product) return false;

    // GPS coordinates are always required
    if (!gpsLocation || (gpsLocation.lat === 0 && gpsLocation.lng === 0)) return false;

    // Certificate number always required
    if (!certificateNumber.trim()) return false;

    // Installation requires additional fields
    if (selectedIntervention.value === 'installazione') {
      return !!(polesNumber.trim() && reason.trim() && notes.trim());
    }

    // For other intervention types, only GPS and certificate are required
    return true;
  }, [selectedIntervention, product, gpsLocation, certificateNumber, polesNumber, reason, notes]);

  // Handle submit
  const handleSubmit = async () => {
    if (!selectedIntervention || !product || !gpsLocation) {
      Alert.alert('Errore', 'Dati mancanti per creare l\'intervento');
      return;
    }

    // Validate GPS coordinates are not (0, 0)
    if (gpsLocation.lat === 0 && gpsLocation.lng === 0) {
      Alert.alert(
        'Errore GPS',
        'Coordinate GPS non valide (0, 0). Rileva nuovamente la posizione prima di continuare.'
      );
      return;
    }

    // Validate certificate number (always required)
    if (!certificateNumber.trim()) {
      Alert.alert(
        'Certificato Richiesto',
        'Inserisci il numero di certificato per l\'intervento.'
      );
      return;
    }

    // INSTALLATION-SPECIFIC VALIDATION (aligned with web version)
    if (selectedIntervention.value === 'installazione') {
      if (!notes.trim()) {
        Alert.alert(
          'Note Richieste',
          'L\'installazione richiede una descrizione dettagliata dell\'intervento.'
        );
        return;
      }

      if (!reason.trim()) {
        Alert.alert(
          'Causale Richiesta',
          'L\'installazione richiede la causale dell\'intervento.'
        );
        return;
      }

      if (!polesNumber.trim()) {
        Alert.alert(
          'Numero Pali Richiesto',
          'L\'installazione richiede il numero di pali installati.'
        );
        return;
      }
    }

    // For other intervention types, notes and reason are optional (backend accepts empty strings)

    setIsSaving(true);

    try {
      const maintenanceData = {
        tipo_intervento: selectedIntervention.value as any,
        gps_lat: gpsLocation.lat,
        gps_lng: gpsLocation.lng,
        // Always include year - mapper will use current year as fallback (aligned with web version)
        year: year.trim() ? parseInt(year.trim()) : undefined,
        poles_number: polesNumber.trim() ? parseInt(polesNumber.trim()) : undefined,
        // Pass reason and notes as-is - mapper allows empty strings for non-installation (aligned with web version)
        reason: reason?.trim() || '',
        note: notes.trim() || '',
        foto_urls: photos,
        userId: userId,
      };

      const request = mapMaintenanceToCreateRequest(
        maintenanceData,
        product.id,
        companyId,
        certificateNumber.trim()
      );

      console.log('📤 [MaintenanceOptionsModal] Sending request:', JSON.stringify(request, null, 2));

      const response = await backendAPI.createMaintenance(request);

      console.log('📥 [MaintenanceOptionsModal] Response:', JSON.stringify(response, null, 2));

      // Success
      Alert.alert(
        'Intervento Completato',
        `${selectedIntervention.label} registrato con successo!\n\nBlockchain TX: ${response.transaction_id.substring(0, 20)}...`,
        [{
          text: 'OK',
          onPress: () => {
            onSelectOption(selectedIntervention.value);
            if (onSuccess) {
              onSuccess();
            }
            onClose();
          }
        }]
      );
    } catch (error: any) {
      console.error('❌ [MaintenanceOptionsModal] Error creating maintenance:', error);
      Alert.alert(
        'Errore Intervento',
        error?.message || 'Impossibile registrare l\'intervento. Riprova.'
      );
    } finally {
      setIsSaving(false);
    }
  };

  if (!visible || !product) {
    return null;
  }

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
          <View className="flex-row items-center p-5 border-b border-gray-200 bg-gradient-to-r from-orange-500/10">
            <View className="w-10 h-10 rounded-full bg-orange-500/10 items-center justify-center mr-3">
              <Ionicons name="build" size={20} color="#F97316" />
            </View>
            <View className="flex-1">
              <Text className="text-xl font-bold text-gray-900">{title}</Text>
              <Text className="text-sm text-gray-600">
                Registra un nuovo intervento di manutenzione sul campo
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} className="p-2" disabled={isSaving}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          {/* Scrollable Content */}
          <ScrollView
            className="flex-1"
            showsVerticalScrollIndicator={true}
            contentContainerStyle={{ paddingBottom: 20 }}
          >
            {/* Product Info - Always visible */}
            <View className="px-6 py-4 bg-gray-50 border-b border-gray-200">
              <View className="flex-row items-center mb-3">
                <Ionicons name="cube" size={20} color="#F97316" />
                <Text className="text-base font-semibold text-gray-900 ml-2">Prodotto Rilevato</Text>
              </View>

              <View className="space-y-2">
                <View className="flex-row justify-between">
                  <Text className="text-sm text-gray-600">QR Code:</Text>
                  <Text className="text-sm font-semibold text-gray-900">{product.qr_code}</Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-sm text-gray-600">Tipo:</Text>
                  <Text className="text-sm font-semibold text-gray-900 flex-1 text-right" numberOfLines={1}>
                    {product.tipo_segnale}
                  </Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-sm text-gray-600">Dimensioni:</Text>
                  <Text className="text-sm font-semibold text-gray-900">{product.dimensioni}</Text>
                </View>
                <View className="flex-row justify-between items-center">
                  <Text className="text-sm text-gray-600">Stato:</Text>
                  <View className={`px-2 py-1 rounded-full ${
                    isInstalled ? 'bg-green-100' : 'bg-orange-100'
                  }`}>
                    <Text className={`text-xs font-bold ${
                      isInstalled ? 'text-green-700' : 'text-orange-700'
                    }`}>
                      {isInstalled ? '✓ Installato' : '⚠ Non Installato'}
                    </Text>
                  </View>
                </View>
              </View>

              {/* History Button */}
              <TouchableOpacity
                className="bg-blue-50 rounded-lg p-3 mt-3 flex-row items-center justify-center"
                onPress={() => {
                  onClose();
                  router.push(`/pages/product/${product.id}`);
                }}
                activeOpacity={0.7}
              >
                <Ionicons name="time-outline" size={16} color="#007AFF" />
                <Text className="text-sm font-medium text-blue-600 ml-2">
                  Visualizza Cronologia Completa
                </Text>
              </TouchableOpacity>
            </View>

            {/* Messaggio informativo per prodotti non installati */}
            {!isInstalled && (
              <View className="px-6 pt-4">
                <View className="bg-orange-50 border border-orange-200 rounded-lg p-4 flex-row items-start">
                  <Ionicons name="information-circle" size={20} color="#F97316" style={{ marginTop: 2 }} />
                  <View className="flex-1 ml-3">
                    <Text className="text-orange-800 font-medium text-sm mb-1">
                      Solo installazione disponibile
                    </Text>
                    <Text className="text-orange-700 text-xs leading-5">
                      Questo prodotto non è ancora installato. Prima di eseguire altri interventi, è necessario completare l'installazione.
                    </Text>
                  </View>
                </View>
              </View>
            )}

            <View className="px-6 py-4">
              {/* Sezione 1: Identificazione & Tipo Intervento */}
              <View className="mb-6">
                <View className="flex-row items-center pb-3 mb-4 border-b border-orange-500/20">
                  <View className="w-8 h-8 rounded-lg bg-orange-500/10 items-center justify-center mr-3">
                    <Text className="text-sm font-bold text-orange-500">1</Text>
                  </View>
                  <Text className="text-lg font-semibold text-gray-900">Tipo Intervento</Text>
                </View>

                {/* Intervention Type Dropdown */}
                <View className="mb-4">
                  <Text className="text-gray-900 text-sm font-medium mb-2">
                    Categoria * <Text className="text-red-500">*</Text>
                  </Text>

                  <TouchableOpacity
                    className="bg-white border border-gray-300 rounded-xl p-4 flex-row items-center justify-between"
                    onPress={() => setShowDropdown(!showDropdown)}
                    activeOpacity={0.7}
                  >
                    <View className="flex-row items-center flex-1">
                      {selectedIntervention ? (
                        <>
                          <View
                            className="w-10 h-10 rounded-full justify-center items-center mr-3"
                            style={{ backgroundColor: selectedIntervention.color + '20' }}
                          >
                            <Ionicons name={selectedIntervention.icon} size={20} color={selectedIntervention.color} />
                          </View>
                          <View className="flex-1">
                            <Text className="text-gray-900 font-medium">{selectedIntervention.label}</Text>
                            <Text className="text-xs text-gray-500">{selectedIntervention.description}</Text>
                          </View>
                        </>
                      ) : (
                        <Text className="text-gray-400">Seleziona tipo intervento...</Text>
                      )}
                    </View>
                    <Ionicons
                      name={showDropdown ? "chevron-up" : "chevron-down"}
                      size={20}
                      color="#666"
                    />
                  </TouchableOpacity>

                  {/* Dropdown Menu */}
                  {showDropdown && (
                    <View className="mt-2 bg-white border border-gray-300 rounded-xl overflow-hidden">
                      {availableInterventions.map((intervention, index) => (
                        <TouchableOpacity
                          key={intervention.value}
                          className={`p-4 flex-row items-center ${
                            index < availableInterventions.length - 1 ? 'border-b border-gray-200' : ''
                          } ${selectedIntervention?.value === intervention.value ? 'bg-orange-50' : ''}`}
                          onPress={() => {
                            setSelectedIntervention(intervention);
                            setShowDropdown(false);
                          }}
                          activeOpacity={0.7}
                        >
                          <View
                            className="w-10 h-10 rounded-full justify-center items-center mr-3"
                            style={{ backgroundColor: intervention.color + '20' }}
                          >
                            <Ionicons name={intervention.icon} size={20} color={intervention.color} />
                          </View>
                          <View className="flex-1">
                            <Text className="text-gray-900 font-medium">{intervention.label}</Text>
                            <Text className="text-xs text-gray-500">{intervention.description}</Text>
                          </View>
                          {selectedIntervention?.value === intervention.value && (
                            <Ionicons name="checkmark-circle" size={20} color="#F97316" />
                          )}
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>

                {selectedIntervention && (
                  <View className="p-3 bg-orange-500/5 border border-orange-500/20 rounded-lg">
                    <View className="flex-row items-center gap-2 mb-1">
                      <Ionicons name={selectedIntervention.icon} size={16} color="#F97316" />
                      <Text className="text-sm font-medium text-orange-700">{selectedIntervention.label}</Text>
                    </View>
                    <Text className="text-xs text-orange-600">
                      {selectedIntervention.description}
                    </Text>
                  </View>
                )}
              </View>

              {/* Sezione 2: Localizzazione */}
              <View className="mb-6">
                <View className="flex-row items-center pb-3 mb-4 border-b border-orange-500/20">
                  <View className="w-8 h-8 rounded-lg bg-orange-500/10 items-center justify-center mr-3">
                    <Text className="text-sm font-bold text-orange-500">2</Text>
                  </View>
                  <Text className="text-lg font-semibold text-gray-900">Localizzazione Intervento</Text>
                </View>

                <View className="p-4 rounded-xl border border-gray-200 bg-gray-50">
                  {isLoadingGPS ? (
                    <View className="flex-row items-center py-3">
                      <ActivityIndicator size="small" color="#F97316" />
                      <Text className="text-gray-600 ml-3">Acquisizione GPS...</Text>
                    </View>
                  ) : gpsLocation ? (
                    <View>
                      <View className="flex-row items-center mb-2">
                        <Ionicons name="location" size={18} color="#10B981" />
                        <Text className="text-green-700 font-medium ml-2">Posizione acquisita</Text>
                      </View>
                      <Text className="text-gray-600 text-sm font-mono mb-3">
                        Lat: {gpsLocation.lat.toFixed(6)}{'\n'}
                        Lng: {gpsLocation.lng.toFixed(6)}
                      </Text>
                      <TouchableOpacity
                        onPress={getCurrentLocation}
                        className="bg-white border border-gray-300 rounded-lg py-2 px-4 flex-row items-center justify-center"
                      >
                        <Ionicons name="refresh" size={16} color="#F97316" />
                        <Text className="text-orange-600 font-medium ml-2">Rileva Nuova Posizione</Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <TouchableOpacity
                      onPress={getCurrentLocation}
                      className="flex-row items-center justify-center py-3"
                    >
                      <Ionicons name="location" size={18} color="#F97316" />
                      <Text className="text-orange-600 font-medium ml-2">Rileva Posizione GPS</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>

              {/* Sezione 2.5: Dettagli Specifici */}
              {selectedIntervention && (
                <View className="mb-6">
                  <View className="flex-row items-center pb-3 mb-4 border-b border-gray-400/20">
                    <View className="w-8 h-8 rounded-lg bg-gray-200 items-center justify-center mr-3">
                      <Text className="text-sm font-bold text-gray-600">2.5</Text>
                    </View>
                    <Text className="text-lg font-semibold text-gray-900">Dettagli Specifici</Text>
                  </View>

                  {/* Year - for installation, replacement, verification, dismissal */}
                  {selectedIntervention.fields.includes('year') && (
                    <FormField
                      label="Anno"
                      value={year}
                      onChangeText={setYear}
                      placeholder="2025"
                      keyboardType="numeric"
                      required
                    />
                  )}

                  {/* Poles Number - only for installation */}
                  {selectedIntervention.value === 'installazione' && (
                    <FormField
                      label="N° Pali"
                      value={polesNumber}
                      onChangeText={setPolesNumber}
                      placeholder="1"
                      keyboardType="numeric"
                      hint="🏗️ Numero pali utilizzati per l'installazione"
                      required
                    />
                  )}

                  {/* Certificate Number - always required */}
                  <FormField
                    label="N° Certificato"
                    value={certificateNumber}
                    onChangeText={setCertificateNumber}
                    placeholder="CERT-2025-001"
                    hint="🏆 Numero certificato associato all'intervento"
                    required
                  />

                  {/* Reason - for specific interventions */}
                  {selectedIntervention.fields.includes('reason') && (
                    <FormField
                      label="Causale"
                      value={reason}
                      onChangeText={setReason}
                      placeholder="Descrivi il motivo dell'intervento..."
                      multiline
                      hint="💡 Specifica dettagliatamente il motivo dell'intervento"
                      required
                    />
                  )}
                </View>
              )}

              {/* Sezione 3: Documentazione */}
              {selectedIntervention && (
                <View className="mb-6">
                  <View className="flex-row items-center pb-3 mb-4 border-b border-orange-500/20">
                    <View className="w-8 h-8 rounded-lg bg-orange-500/10 items-center justify-center mr-3">
                      <Text className="text-sm font-bold text-orange-500">3</Text>
                    </View>
                    <Text className="text-lg font-semibold text-gray-900">Documentazione Intervento</Text>
                  </View>

                  {/* Notes */}
                  <FormField
                    label="Descrizione Intervento"
                    value={notes}
                    onChangeText={setNotes}
                    placeholder={`Descrivi dettagliatamente l'intervento effettuato:\n• Stato del segnale prima dell'intervento\n• Operazioni eseguite\n• Eventuali anomalie riscontrate\n• Materiali utilizzati`}
                    multiline
                    numberOfLines={6}
                    hint="ℹ️ Una descrizione dettagliata aiuta nella tracciabilità"
                    required
                  />

                  {/* Photos */}
                  <View className="mb-4">
                    <Text className="text-gray-900 text-sm font-medium mb-2">
                      Documentazione Fotografica (opzionale)
                    </Text>

                    <TouchableOpacity
                      onPress={pickImage}
                      className="bg-white border border-gray-300 rounded-xl p-4 flex-row items-center justify-center mb-3"
                      activeOpacity={0.7}
                    >
                      <Ionicons name="camera" size={20} color="#F97316" />
                      <Text className="text-orange-600 font-medium ml-2">
                        {photos.length > 0 ? 'Aggiungi Altre Foto' : 'Scatta/Carica Foto'}
                      </Text>
                    </TouchableOpacity>

                    {photos.length > 0 && (
                      <View>
                        <View className="flex-row items-center gap-2 mb-2">
                          <View className="w-2 h-2 bg-orange-500 rounded-full" />
                          <Text className="text-sm text-orange-700 font-medium">
                            {photos.length} foto caricate
                          </Text>
                        </View>

                        <View className="flex-row flex-wrap gap-2">
                          {photos.map((uri, index) => (
                            <View key={index} className="relative">
                              <View className="w-20 h-20 rounded-lg overflow-hidden bg-gray-200">
                                <Image
                                  source={{ uri }}
                                  className="w-full h-full"
                                  resizeMode="cover"
                                />
                              </View>
                              <TouchableOpacity
                                onPress={() => removePhoto(index)}
                                className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full items-center justify-center"
                                activeOpacity={0.7}
                              >
                                <Ionicons name="close" size={14} color="white" />
                              </TouchableOpacity>
                            </View>
                          ))}
                        </View>
                      </View>
                    )}

                    <Text className="text-xs text-gray-500 mt-2">
                      📸 Consigliato: Foto prima, durante e dopo l'intervento
                    </Text>
                  </View>
                </View>
              )}
            </View>
          </ScrollView>

          {/* Footer */}
          <View className="p-5 border-t border-gray-200 bg-white">
            <View className="flex-row items-center mb-3">
              <Text className="text-sm text-gray-600 flex-1">* Campi obbligatori</Text>
            </View>

            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={onClose}
                disabled={isSaving}
                className="flex-1 px-4 py-3 rounded-xl border border-gray-300 bg-white"
                activeOpacity={0.7}
              >
                <Text className="text-gray-700 font-semibold text-center">Annulla</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleSubmit}
                disabled={!isFormValid || isSaving}
                className={`flex-1 px-4 py-3 rounded-xl flex-row items-center justify-center ${
                  isFormValid && !isSaving ? 'bg-orange-500' : 'bg-gray-300'
                }`}
                activeOpacity={0.7}
              >
                {isSaving ? (
                  <>
                    <ActivityIndicator size="small" color="white" />
                    <Text className="text-white font-semibold ml-2">Salvando...</Text>
                  </>
                ) : (
                  <>
                    <Ionicons name="save" size={18} color="#fff" />
                    <Text className="text-white font-semibold ml-1">Registra Intervento</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

// Form Field Component
interface FormFieldProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  hint?: string;
  keyboardType?: 'default' | 'numeric' | 'decimal-pad';
  multiline?: boolean;
  numberOfLines?: number;
  required?: boolean;
}

const FormField = React.memo<FormFieldProps>(({
  label,
  value,
  onChangeText,
  placeholder,
  hint,
  keyboardType = 'default',
  multiline = false,
  numberOfLines = 1,
  required = false
}) => (
  <View className="mb-4">
    <Text className="text-gray-900 text-sm font-medium mb-2">
      {label} {required && <Text className="text-red-500">*</Text>}
    </Text>
    <TextInput
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      keyboardType={keyboardType}
      multiline={multiline}
      numberOfLines={multiline ? numberOfLines : 1}
      className="border border-gray-300 rounded-xl px-4 py-3 text-gray-900 bg-white"
      placeholderTextColor="#9CA3AF"
      style={multiline ? { textAlignVertical: 'top', minHeight: 100 } : undefined}
    />
    {hint && (
      <Text className="text-xs text-gray-500 mt-1">
        {hint}
      </Text>
    )}
  </View>
));

FormField.displayName = 'FormField';
