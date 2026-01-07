// Modal per la creazione di prodotti dalla homepage
// Two-step wizard identico alla versione web
// Step 1: Selezione tipologia (Permanent/Temporary)
// Step 2: Form completo con dettagli prodotto

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  ActivityIndicator,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { backendAPI, FIXED_USER_ID } from '@/lib/api/backend';
import { mapProductToCreateRequest } from '@/lib/api/mappers';
import { Product } from '@certplus/types';

interface CreateProductModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

interface ProductFormData {
  qr_code: string;
  signal_type: 'permanent' | 'temporary' | '';
  signal_category: string;
  production_year: string;
  shape: string;
  dimension: string;
  support_material: string;
  support_thickness: string;
  wl_code: string;
  fixation_class: string;
  fixation_method: string;
  created_by: string;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Opzioni predefinite per i select
const SHAPES = [
  'Triangolare',
  'Circolare',
  'Rettangolare',
  'Quadrata',
  'Ottagonale',
  'Romboidale',
  'Freccia',
  'Personalizzata'
];

const FIXATION_CLASSES = [
  'Classe 1',
  'Classe 2',
  'Classe 2s',
  'Classe IIs',
  'Classe 3'
];

const FIXATION_METHODS = [
  'Tasselli',
  'Pali',
  'Viti',
  'Fascette',
  'Staffe',
  'Struttura a portale',
  'Base zavorrabile',
  'Sistema modulare',
  'Altri'
];

export default function CreateProductModal({
  visible,
  onClose,
  onSuccess
}: CreateProductModalProps) {
  // Wizard step state
  const [currentStep, setCurrentStep] = useState(1);

  // Helper per generare QR code univoco
  const generateQRCode = () => `QR${Date.now()}`;

  // Form state
  const [formData, setFormData] = useState<ProductFormData>({
    qr_code: generateQRCode(),
    signal_type: '',
    signal_category: '',
    production_year: new Date().getFullYear().toString(),
    shape: '',
    dimension: '',
    support_material: '',
    support_thickness: '',
    wl_code: '',
    fixation_class: '',
    fixation_method: '',
    created_by: FIXED_USER_ID // Test version without login
  });

  const [isSaving, setIsSaving] = useState(false);
  const [showValidation, setShowValidation] = useState(false);

  // Reset form quando il modal si apre/chiude
  useEffect(() => {
    if (visible) {
      setCurrentStep(1);
      setShowValidation(false);
      setFormData({
        qr_code: generateQRCode(),
        signal_type: '',
        signal_category: '',
        production_year: new Date().getFullYear().toString(),
        shape: '',
        dimension: '',
        support_material: '',
        support_thickness: '',
        wl_code: '',
        fixation_class: '',
        fixation_method: '',
        created_by: FIXED_USER_ID // Test version without login
      });
    }
  }, [visible]);

  // Handle input change
  const handleInputChange = useCallback((field: keyof ProductFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  // Handle signal type selection (auto-advance to step 2)
  const handleSignalTypeSelect = useCallback((type: 'permanent' | 'temporary') => {
    handleInputChange('signal_type', type);
    // Auto-advance to next step after selection with delay for visual feedback
    setTimeout(() => {
      setCurrentStep(2);
    }, 300);
  }, [handleInputChange]);

  // Step validation
  const isStep1Valid = useMemo(() => formData.signal_type !== '', [formData.signal_type]);

  // Validazione migliorata con trim e identificazione campi mancanti
  const getInvalidFields = useMemo(() => {
    const invalidFields: string[] = [];
    const requiredFields = [
      { key: 'qr_code', label: 'Codice QR' },
      { key: 'signal_type', label: 'Tipo Segnale' },
      { key: 'signal_category', label: 'Categoria Segnale' },
      { key: 'production_year', label: 'Anno Produzione' },
      { key: 'shape', label: 'Forma Geometrica' },
      { key: 'dimension', label: 'Dimensioni' },
      { key: 'wl_code', label: 'Codice WL' },
      { key: 'support_material', label: 'Materiale Supporto' },
      { key: 'support_thickness', label: 'Spessore Supporto' },
      { key: 'fixation_class', label: 'Classe Pellicola' },
      { key: 'fixation_method', label: 'Metodo Fissaggio' }
    ];

    requiredFields.forEach(({ key, label }) => {
      const value = formData[key as keyof ProductFormData];
      if (!value || (typeof value === 'string' && value.trim() === '')) {
        invalidFields.push(label);
      }
    });

    return invalidFields;
  }, [formData]);

  const isFormValid = useMemo(() => getInvalidFields.length === 0, [getInvalidFields]);

  // Helper per controllare se un campo è invalido
  const isFieldInvalid = useCallback((fieldKey: keyof ProductFormData) => {
    if (!showValidation) return false;
    const value = formData[fieldKey];
    return !value || (typeof value === 'string' && value.trim() === '');
  }, [showValidation, formData]);

  // Navigation handlers
  const handleNextStep = useCallback(() => {
    if (currentStep === 1 && isStep1Valid) {
      setCurrentStep(2);
    }
  }, [currentStep, isStep1Valid]);

  const handlePrevStep = useCallback(() => {
    if (currentStep === 2) {
      setCurrentStep(1);
    }
  }, [currentStep]);

  // Handle submit
  const handleSubmit = useCallback(async () => {
    // Attiva la validazione visiva
    setShowValidation(true);

    if (!isFormValid) {
      const missingFields = getInvalidFields.join('\n• ');
      Alert.alert(
        'Campi Obbligatori Mancanti',
        `Compila i seguenti campi prima di continuare:\n\n• ${missingFields}`,
        [{ text: 'OK', style: 'default' }]
      );
      return;
    }

    setIsSaving(true);

    try {
      // Create product object for mapping
      const productData: Partial<Product> = {
        qr_code: formData.qr_code.trim(),
        tipo_segnale: `${formData.signal_type} - ${formData.signal_category}`.trim(),
        anno: parseInt(formData.production_year),
        forma: formData.shape,
        dimensioni: formData.dimension.trim(),
        wl: formData.wl_code.trim(),
        materiale_supporto: formData.support_material.trim(),
        spessore_supporto: parseFloat(formData.support_thickness),
        materiale_pellicola: formData.fixation_class,
        fissaggio: formData.fixation_method,
      };

      // Map to backend request format (using fixed user ID for test version)
      const request = mapProductToCreateRequest(productData, FIXED_USER_ID);

      console.log('📤 [CreateProductModal] Sending request:', JSON.stringify(request, null, 2));

      // Call backend API
      const response = await backendAPI.createProduct(request);

      console.log('📥 [CreateProductModal] Response:', JSON.stringify(response, null, 2));

      // Success - Toast success message
      Alert.alert(
        'Prodotto Creato',
        `Prodotto creato con successo!\n\nQR Code: ${formData.qr_code}\nAsset ID: ${response.asset_id}`,
        [{
          text: 'OK',
          onPress: () => {
            onClose();
            if (onSuccess) {
              onSuccess();
            }
          }
        }]
      );
    } catch (error: any) {
      console.error('❌ [CreateProductModal] Error creating product:', error);

      // Toast error message
      Alert.alert(
        'Errore durante il salvataggio',
        error?.message || 'Si è verificato un errore. Riprova più tardi.'
      );
    } finally {
      setIsSaving(false);
    }
  }, [formData, isFormValid, getInvalidFields, onClose, onSuccess]);

  // Handle close
  const handleClose = useCallback(() => {
    // Check if form has data (excluding auto-generated fields)
    const hasData = formData.signal_type || formData.signal_category || formData.shape ||
                     formData.dimension || formData.support_material;

    if (hasData && !isSaving) {
      Alert.alert(
        'Attenzione',
        'Hai dati non salvati. Vuoi uscire senza salvare?',
        [
          { text: 'Annulla', style: 'cancel' },
          {
            text: 'Esci',
            style: 'destructive',
            onPress: () => {
              setCurrentStep(1);
              onClose();
            }
          }
        ]
      );
    } else if (!isSaving) {
      setCurrentStep(1);
      onClose();
    }
  }, [formData, isSaving, onClose]);

  // Render Step 1: Signal Type Selection
  const renderStep1 = () => (
    <View className="flex-1 items-center justify-center px-6 py-8">
      <View className="w-full max-w-2xl">
        {/* Header */}
        <View className="items-center mb-8">
          <View className="w-16 h-16 bg-[#2A9D8F]/10 rounded-full items-center justify-center mb-4">
            <Ionicons name="cube-outline" size={32} color="#2A9D8F" />
          </View>
          <Text className="text-2xl font-bold text-gray-900 text-center mb-2">
            Seleziona Tipologia Segnaletica
          </Text>
          <Text className="text-base text-gray-600 text-center">
            Scegli il tipo di segnaletica che vuoi creare
          </Text>
        </View>

        {/* Signal Type Cards */}
        <View className="gap-4">
          {/* Permanent Signal */}
          <TouchableOpacity
            onPress={() => handleSignalTypeSelect('permanent')}
            activeOpacity={0.7}
            className={`p-6 rounded-2xl border-2 ${
              formData.signal_type === 'permanent'
                ? 'border-[#2A9D8F] bg-[#2A9D8F]/5'
                : 'border-gray-200 bg-white'
            }`}
            style={{
              shadowColor: formData.signal_type === 'permanent' ? '#2A9D8F' : '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: formData.signal_type === 'permanent' ? 0.1 : 0.05,
              shadowRadius: 8,
              elevation: formData.signal_type === 'permanent' ? 4 : 2,
            }}
          >
            <View className="flex-row items-center">
              <View className={`w-16 h-16 rounded-full items-center justify-center ${
                formData.signal_type === 'permanent' ? 'bg-[#2A9D8F]' : 'bg-gray-100'
              }`}>
                <Ionicons
                  name="shield-checkmark"
                  size={32}
                  color={formData.signal_type === 'permanent' ? '#fff' : '#6B7280'}
                />
              </View>
              <View className="flex-1 ml-4">
                <Text className="text-lg font-bold text-gray-900 mb-1">
                  Segnaletica Permanente
                </Text>
                <Text className="text-sm text-gray-600 leading-5">
                  Segnali fissi installati in modo permanente per la regolamentazione del traffico
                </Text>
              </View>
              {formData.signal_type === 'permanent' && (
                <View className="w-6 h-6 bg-[#2A9D8F] rounded-full items-center justify-center ml-2">
                  <View className="w-2 h-2 bg-white rounded-full" />
                </View>
              )}
            </View>
          </TouchableOpacity>

          {/* Temporary Signal */}
          <TouchableOpacity
            onPress={() => handleSignalTypeSelect('temporary')}
            activeOpacity={0.7}
            className={`p-6 rounded-2xl border-2 ${
              formData.signal_type === 'temporary'
                ? 'border-[#2A9D8F] bg-[#2A9D8F]/5'
                : 'border-gray-200 bg-white'
            }`}
            style={{
              shadowColor: formData.signal_type === 'temporary' ? '#2A9D8F' : '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: formData.signal_type === 'temporary' ? 0.1 : 0.05,
              shadowRadius: 8,
              elevation: formData.signal_type === 'temporary' ? 4 : 2,
            }}
          >
            <View className="flex-row items-center">
              <View className={`w-16 h-16 rounded-full items-center justify-center ${
                formData.signal_type === 'temporary' ? 'bg-[#2A9D8F]' : 'bg-gray-100'
              }`}>
                <Ionicons
                  name="time-outline"
                  size={32}
                  color={formData.signal_type === 'temporary' ? '#fff' : '#6B7280'}
                />
              </View>
              <View className="flex-1 ml-4">
                <Text className="text-lg font-bold text-gray-900 mb-1">
                  Segnaletica Temporanea
                </Text>
                <Text className="text-sm text-gray-600 leading-5">
                  Segnali temporanei per cantieri, eventi o situazioni di emergenza
                </Text>
              </View>
              {formData.signal_type === 'temporary' && (
                <View className="w-6 h-6 bg-[#2A9D8F] rounded-full items-center justify-center ml-2">
                  <View className="w-2 h-2 bg-white rounded-full" />
                </View>
              )}
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  // Render Step 2: Product Details Form
  const renderStep2 = () => (
    <ScrollView
      className="flex-1"
      showsVerticalScrollIndicator={true}
      contentContainerStyle={{ paddingBottom: 20 }}
    >
      <View className="px-6 py-4">
        {/* Sezione 1: Identificazione Segnale */}
        <View className="mb-6">
          <View className="flex-row items-center pb-3 mb-4 border-b border-[#2A9D8F]/20">
            <View className="w-8 h-8 rounded-lg bg-[#2A9D8F]/10 items-center justify-center mr-3">
              <Text className="text-sm font-bold text-[#2A9D8F]">1</Text>
            </View>
            <Text className="text-lg font-semibold text-gray-900">Identificazione Segnale</Text>
          </View>

          {/* QR Code */}
          <FormField
            label="Codice QR *"
            value={formData.qr_code}
            onChangeText={(value) => handleInputChange('qr_code', value)}
            placeholder="QR1703123456789"
            hint="Codice univoco generato automaticamente (modificabile)"
            autoCapitalize="characters"
            error={isFieldInvalid('qr_code')}
          />

          {/* Signal Category */}
          <FormField
            label="Categoria Segnale *"
            value={formData.signal_category}
            onChangeText={(value) => handleInputChange('signal_category', value)}
            placeholder="Pericolo - Lavori in corso"
            hint="Descrizione dettagliata della categoria di segnale"
            error={isFieldInvalid('signal_category')}
          />

          {/* Production Year */}
          <FormField
            label="Anno Produzione *"
            value={formData.production_year}
            onChangeText={(value) => handleInputChange('production_year', value)}
            placeholder="2024"
            keyboardType="numeric"
            error={isFieldInvalid('production_year')}
          />

          {/* Shape - Multi-select buttons */}
          <View className="mb-4">
            <View className="flex-row items-center mb-2">
              <Text className="text-gray-900 text-base font-semibold">Forma Geometrica *</Text>
              {isFieldInvalid('shape') && (
                <View className="ml-2 flex-row items-center">
                  <Ionicons name="alert-circle" size={16} color="#EF4444" />
                  <Text className="text-xs text-red-500 ml-1">Campo obbligatorio</Text>
                </View>
              )}
            </View>
            <View className={`flex-row flex-wrap gap-2 p-3 rounded-xl border ${
              isFieldInvalid('shape') ? 'border-red-500 border-2 bg-red-50' : 'border-transparent'
            }`}>
              {SHAPES.map((shape) => (
                <TouchableOpacity
                  key={shape}
                  onPress={() => handleInputChange('shape', shape)}
                  activeOpacity={0.7}
                  className={`px-4 py-2 rounded-full border ${
                    formData.shape === shape
                      ? 'border-[#2A9D8F] bg-[#2A9D8F]/10'
                      : 'border-gray-300 bg-white'
                  }`}
                >
                  <Text className={`text-sm font-medium ${
                    formData.shape === shape ? 'text-[#2A9D8F]' : 'text-gray-700'
                  }`}>
                    {shape}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Dimension */}
          <FormField
            label="Dimensioni *"
            value={formData.dimension}
            onChangeText={(value) => handleInputChange('dimension', value)}
            placeholder="60x60 cm"
            error={isFieldInvalid('dimension')}
          />

          {/* WL Code */}
          <FormField
            label="Codice WL *"
            value={formData.wl_code}
            onChangeText={(value) => handleInputChange('wl_code', value.toUpperCase())}
            placeholder="WL001"
            autoCapitalize="characters"
            error={isFieldInvalid('wl_code')}
          />
        </View>

        {/* Sezione 2: Specifiche Materiali */}
        <View className="mb-6">
          <View className="flex-row items-center pb-3 mb-4 border-b border-[#2A9D8F]/20">
            <View className="w-8 h-8 rounded-lg bg-[#2A9D8F]/10 items-center justify-center mr-3">
              <Text className="text-sm font-bold text-[#2A9D8F]">2</Text>
            </View>
            <Text className="text-lg font-semibold text-gray-900">Specifiche Materiali</Text>
          </View>

          {/* Support Material & Thickness */}
          <View className="p-4 rounded-xl border border-gray-200 bg-gray-50/50 mb-4">
            <Text className="font-medium text-gray-900 mb-3">Supporto</Text>

            <FormField
              label="Materiale *"
              value={formData.support_material}
              onChangeText={(value) => handleInputChange('support_material', value)}
              placeholder="Alluminio, Acciaio..."
              error={isFieldInvalid('support_material')}
            />

            <FormField
              label="Spessore (mm) *"
              value={formData.support_thickness}
              onChangeText={(value) => handleInputChange('support_thickness', value)}
              placeholder="2.0"
              keyboardType="decimal-pad"
              error={isFieldInvalid('support_thickness')}
            />
          </View>

          {/* Fixation Class & Method */}
          <View className="p-4 rounded-xl border border-gray-200 bg-gray-50/50 mb-4">
            <Text className="font-medium text-gray-900 mb-3">Pellicola & Montaggio</Text>

            {/* Fixation Class - Multi-select */}
            <View className="mb-4">
              <View className="flex-row items-center mb-2">
                <Text className="text-gray-900 text-sm font-medium">Classe Pellicola *</Text>
                {isFieldInvalid('fixation_class') && (
                  <View className="ml-2 flex-row items-center">
                    <Ionicons name="alert-circle" size={16} color="#EF4444" />
                    <Text className="text-xs text-red-500 ml-1">Campo obbligatorio</Text>
                  </View>
                )}
              </View>
              <View className={`flex-row flex-wrap gap-2 p-2 rounded-xl border ${
                isFieldInvalid('fixation_class') ? 'border-red-500 border-2 bg-red-50' : 'border-transparent'
              }`}>
                {FIXATION_CLASSES.map((cls) => (
                  <TouchableOpacity
                    key={cls}
                    onPress={() => handleInputChange('fixation_class', cls)}
                    activeOpacity={0.7}
                    className={`px-3 py-2 rounded-full border ${
                      formData.fixation_class === cls
                        ? 'border-[#2A9D8F] bg-[#2A9D8F]/10'
                        : 'border-gray-300 bg-white'
                    }`}
                  >
                    <Text className={`text-sm font-medium ${
                      formData.fixation_class === cls ? 'text-[#2A9D8F]' : 'text-gray-700'
                    }`}>
                      {cls}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Fixation Method - Multi-select */}
            <View className="mb-0">
              <View className="flex-row items-center mb-2">
                <Text className="text-gray-900 text-sm font-medium">Metodo Fissaggio *</Text>
                {isFieldInvalid('fixation_method') && (
                  <View className="ml-2 flex-row items-center">
                    <Ionicons name="alert-circle" size={16} color="#EF4444" />
                    <Text className="text-xs text-red-500 ml-1">Campo obbligatorio</Text>
                  </View>
                )}
              </View>
              <View className={`flex-row flex-wrap gap-2 p-2 rounded-xl border ${
                isFieldInvalid('fixation_method') ? 'border-red-500 border-2 bg-red-50' : 'border-transparent'
              }`}>
                {FIXATION_METHODS.map((method) => (
                  <TouchableOpacity
                    key={method}
                    onPress={() => handleInputChange('fixation_method', method)}
                    activeOpacity={0.7}
                    className={`px-3 py-2 rounded-full border ${
                      formData.fixation_method === method
                        ? 'border-[#2A9D8F] bg-[#2A9D8F]/10'
                        : 'border-gray-300 bg-white'
                    }`}
                  >
                    <Text className={`text-sm font-medium ${
                      formData.fixation_method === method ? 'text-[#2A9D8F]' : 'text-gray-700'
                    }`}>
                      {method}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        </View>

        {/* Sezione 3: Documentazione (Opzionale) */}
        <View className="mb-6">
          <View className="flex-row items-center pb-3 mb-4 border-b border-gray-300/50">
            <View className="w-8 h-8 rounded-lg bg-gray-200 items-center justify-center mr-3">
              <Text className="text-sm font-medium text-gray-600">3</Text>
            </View>
            <View className="flex-1">
              <Text className="text-lg font-semibold text-gray-900">Documentazione</Text>
              <Text className="text-xs text-gray-600">Opzionale - L'icona viene generata automaticamente</Text>
            </View>
          </View>

          <View className="p-4 rounded-xl border border-dashed border-gray-400 bg-gray-50/30">
            <Text className="text-sm text-gray-700 mb-2">📸 Figura Prodotto (Opzionale)</Text>
            <Text className="text-xs text-gray-500 leading-5">
              ℹ️ Le icone vengono generate automaticamente in base al tipo e forma del segnale.
              L'upload immagini sarà disponibile in un prossimo aggiornamento.
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );

  if (!visible) {
    return null;
  }

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={handleClose}
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
          <View className="flex-row items-center p-5 border-b border-gray-200 bg-white">
            <View className="w-10 h-10 rounded-full bg-[#2A9D8F]/10 items-center justify-center mr-3">
              <Ionicons name="cube" size={20} color="#2A9D8F" />
            </View>
            <View className="flex-1">
              <Text className="text-xl font-bold text-gray-900">Nuovo Prodotto</Text>
              <Text className="text-sm text-gray-600">
                Crea un nuovo segnale nel database aziendale
              </Text>
            </View>
            <TouchableOpacity onPress={handleClose} className="p-2" disabled={isSaving}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          {/* Step Content */}
          <View className="flex-1">
            {currentStep === 1 ? renderStep1() : renderStep2()}
          </View>

          {/* Footer with Timeline and Actions */}
          <View className="p-5 border-t border-gray-200 bg-white">
            {/* Step Timeline */}
            <View className="flex-row items-center mb-4">
              <View className="flex-row items-center gap-2">
                <View className={`w-8 h-8 rounded-full items-center justify-center ${
                  currentStep >= 1 ? 'bg-[#2A9D8F]' : 'bg-gray-200'
                }`}>
                  <Text className={`text-sm font-medium ${
                    currentStep >= 1 ? 'text-white' : 'text-gray-600'
                  }`}>1</Text>
                </View>
                <Text className={`text-sm font-medium ${
                  currentStep >= 1 ? 'text-gray-900' : 'text-gray-500'
                }`}>
                  Tipologia
                </Text>
              </View>

              <View className={`flex-1 h-0.5 mx-3 ${
                currentStep >= 2 ? 'bg-[#2A9D8F]' : 'bg-gray-200'
              }`} />

              <View className="flex-row items-center gap-2">
                <View className={`w-8 h-8 rounded-full items-center justify-center ${
                  currentStep >= 2 ? 'bg-[#2A9D8F]' : 'bg-gray-200'
                }`}>
                  <Text className={`text-sm font-medium ${
                    currentStep >= 2 ? 'text-white' : 'text-gray-600'
                  }`}>2</Text>
                </View>
                <Text className={`text-sm font-medium ${
                  currentStep >= 2 ? 'text-gray-900' : 'text-gray-500'
                }`}>
                  Dettagli
                </Text>
              </View>
            </View>

            {/* Action Buttons */}
            <View className="flex-row gap-3">
              {currentStep === 2 && (
                <TouchableOpacity
                  onPress={handlePrevStep}
                  disabled={isSaving}
                  className="px-4 py-3 rounded-xl border border-gray-300 bg-white flex-row items-center justify-center"
                  activeOpacity={0.7}
                >
                  <Ionicons name="chevron-back" size={18} color="#666" />
                  <Text className="text-gray-700 font-semibold ml-1">Indietro</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                onPress={handleClose}
                disabled={isSaving}
                className="flex-1 px-4 py-3 rounded-xl border border-gray-300 bg-white"
                activeOpacity={0.7}
              >
                <Text className="text-gray-700 font-semibold text-center">Annulla</Text>
              </TouchableOpacity>

              {currentStep === 1 ? (
                <TouchableOpacity
                  onPress={handleNextStep}
                  disabled={!isStep1Valid}
                  className={`flex-1 px-4 py-3 rounded-xl flex-row items-center justify-center ${
                    isStep1Valid ? 'bg-[#2A9D8F]' : 'bg-gray-300'
                  }`}
                  activeOpacity={0.7}
                >
                  <Text className="text-white font-semibold mr-1">Continua</Text>
                  <Ionicons name="chevron-forward" size={18} color="#fff" />
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  onPress={handleSubmit}
                  disabled={!isFormValid || isSaving}
                  className={`flex-1 px-4 py-3 rounded-xl flex-row items-center justify-center ${
                    isFormValid && !isSaving ? 'bg-[#2A9D8F]' : 'bg-gray-300'
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
                      <Ionicons name="checkmark-circle" size={18} color="#fff" />
                      <Text className="text-white font-semibold ml-1">Crea Prodotto</Text>
                    </>
                  )}
                </TouchableOpacity>
              )}
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
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  error?: boolean;
}

const FormField = React.memo<FormFieldProps>(({
  label,
  value,
  onChangeText,
  placeholder,
  hint,
  keyboardType = 'default',
  autoCapitalize = 'sentences',
  error = false
}) => (
  <View className="mb-4">
    <View className="flex-row items-center mb-2">
      <Text className="text-gray-900 text-sm font-medium">{label}</Text>
      {error && (
        <View className="ml-2 flex-row items-center">
          <Ionicons name="alert-circle" size={16} color="#EF4444" />
          <Text className="text-xs text-red-500 ml-1">Campo obbligatorio</Text>
        </View>
      )}
    </View>
    <TextInput
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      keyboardType={keyboardType}
      autoCapitalize={autoCapitalize}
      className={`border rounded-xl px-4 py-3 text-gray-900 bg-white ${
        error ? 'border-red-500 border-2' : 'border-gray-300'
      }`}
      placeholderTextColor="#9CA3AF"
    />
    {hint && !error && (
      <Text className="text-xs text-gray-500 mt-1">
        {hint}
      </Text>
    )}
  </View>
));

FormField.displayName = 'FormField';
