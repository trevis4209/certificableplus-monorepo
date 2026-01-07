// Scanner refactored con architettura modulare e performance ottimizzate
// Utilizza custom hooks, componenti estratti e gestione stato centralizzata

import { useFocusEffect } from '@react-navigation/native';
import { BarcodeScanningResult, CameraType, useCameraPermissions } from 'expo-camera';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useEffect, useReducer } from 'react';
import { ActivityIndicator, StatusBar, Text, TouchableOpacity, View } from 'react-native';

// Componenti modulari estratti
import CameraScanner from '../../components/scanner/CameraScanner';
import TabSelector from '../../components/scanner/TabSelector';

// Modal esistenti
import MaintenanceOptionsModal from '../../components/modals/MaintenanceOptionsModal';
import ProductViewModal from '../../components/modals/ProductViewModal';

// Custom hooks
import { useModalManager } from '../../hooks/scanner/useModalManager';
import { useScannerOperations } from '../../hooks/scanner/useScannerOperations';
import { useComponentCleanup, useRouterCleanup } from '../../utils/cleanup';
import { useProductLookup } from '../../utils/memoization';
import { useBackendData } from '../../hooks/useBackendData';

// State management
import {
  createProductAction,
  createScanAction,
  initialScannerState,
  scannerReducer,
} from '../../hooks/scanner/useReducers';

// Types e utilities
import { Ionicons } from '@expo/vector-icons';
import type { Product as OriginalProduct } from '../../types';
import { EmployeePermission, ScanOperation } from '../../types/scanner';

const ScannerPage: React.FC = React.memo(() => {
  const { operation } = useLocalSearchParams<{ operation?: string }>();
  
  
  // Gestione camera
  const [permission, requestPermission] = useCameraPermissions();
  const facing: CameraType = 'back';
  
  // State management centralizzato con reducers - imposta 'add_intervention' come default
  const [scannerState, scannerDispatch] = useReducer(scannerReducer, {
    ...initialScannerState,
    selectedOperation: (operation as ScanOperation) || 'add_intervention',
  });

  // Handler per tornare alla homepage - moved before early returns
  const handleGoBack = useCallback(() => {
    router.push('/');
  }, []);

  // Aggiornamento automatico quando cambia l'operazione
  useEffect(() => {
    if (operation) {
      scannerDispatch({ 
        type: 'SET_SELECTED_OPERATION', 
        operation: operation as ScanOperation 
      });
      setScanned(false); // Reset scansione
    }
  }, [operation]);
  
  // Gestione modal centralizzata
  const {
    modalState,
    showModal,
    hideModal,
    resetModals,
    showProductRelatedModal,
  } = useModalManager();
  
  // Custom hooks per performance e cleanup
  const productLookup = useProductLookup();
  const cleanup = useComponentCleanup();
  const { cleanupRouter } = useRouterCleanup(operation, router);

  // Backend data hook
  const {
    findProductByQRCode,
    refreshData
  } = useBackendData();
  
  // Auto-request camera permission
  useEffect(() => {
    if (!permission?.granted) {
      requestPermission();
    }
  }, [permission?.granted, requestPermission]);
  
  // Helper functions per aggiornare lo stato del scanner
  const setScanned = useCallback((scanned: boolean) => {
    scannerDispatch(createScanAction(scanned));
  }, []);

  const setFoundProduct = useCallback((product: OriginalProduct | null) => {
    scannerDispatch(createProductAction(product));
  }, []);

  const setProductStatus = useCallback((status: 'not installed' | 'installed') => {
    scannerDispatch({ type: 'SET_PRODUCT_STATUS', status });
  }, []);

  const setEmployeePermissions = useCallback((permissions: string[]) => {
    scannerDispatch({ type: 'SET_EMPLOYEE_PERMISSIONS', permissions: permissions as EmployeePermission[] });
  }, []);

  const setScannedQR = useCallback((qr: string) => {
    scannerDispatch({ type: 'SET_SCANNED_QR', qr });
  }, []);
  
  // Custom hook per le operazioni di scansione
  const scannerOperations = useScannerOperations({
    selectedOperation: scannerState.selectedOperation,
    setFoundProduct,
    setProductStatus,
    setEmployeePermissions,
    setScanned,
    showModal: (modalType: string) => showModal(modalType as keyof typeof modalState),
    showOptionsModal: () => showProductRelatedModal('showOptionsModal'),
    showProductViewModal: () => showProductRelatedModal('showProductViewModal'),
  });

  // Gestione focus della pagina con cleanup sicuro
  useFocusEffect(
    useCallback(() => {
      // Imposta operazione di default se non specificata
      if (!operation) {
        scannerDispatch({ type: 'SET_SELECTED_OPERATION', operation: 'add_intervention' });
      } else {
        scannerDispatch({ type: 'SET_SELECTED_OPERATION', operation: operation as ScanOperation });
      }
      
      // Reset completo dello stato
      scannerDispatch({ type: 'RESET_SCANNER' });
      resetModals();
      
      // Cleanup gestito dal custom hook useRouterCleanup
      return () => {
        cleanupRouter();
        cleanup.cleanupAll();
      };
    }, [operation, resetModals, cleanupRouter, cleanup.cleanupAll])
  );

  // Handler principale per la scansione QR (memoized per performance)
  const handleBarCodeScanned = useCallback(({ data }: BarcodeScanningResult) => {
    if (scannerState.scanned) return;
    
    // Aggiorna stato immediatamente
    setScanned(true);
    setScannedQR(data);
    
    // Lookup del prodotto dal backend
    const product = findProductByQRCode(data);
    
    // Gestione operazioni con custom hook
    switch (scannerState.selectedOperation) {
      case 'view_product':
        scannerOperations.handleViewProduct(product, data);
        break;
      case 'add_intervention':
        scannerOperations.handleAddIntervention(product, data);
        break;
      default:
        scannerOperations.handleOriginalScanLogic(product, data);
        break;
    }
  }, [
    scannerState.scanned, 
    scannerState.selectedOperation,
    setScanned,
    setScannedQR,
    productLookup,
    scannerOperations
  ]);

  // Reset completo dello stato del scanner (definito prima per evitare circolari)
  const resetScannerState = useCallback(() => {
    resetModals();
    scannerDispatch({ type: 'RESET_SCANNER' });
  }, [resetModals]);

  // Handler per la selezione dell'operazione tramite tab
  const handleOperationSelect = useCallback((selectedOp: ScanOperation) => {
    scannerDispatch({ type: 'SET_SELECTED_OPERATION', operation: selectedOp });
    // Reset dello stato di scansione quando cambia operazione
    setScanned(false);
  }, [setScanned]);

  // Handler for maintenance success (called by MaintenanceOptionsModal after successful creation)
  const handleMaintenanceSuccess = useCallback(async () => {
    await refreshData();
    resetScannerState();
  }, [refreshData, resetScannerState]);

  // Chiusura modal con cleanup
  const handleModalClose = useCallback((modalType: keyof typeof modalState) => {
    hideModal(modalType);
    resetScannerState();
  }, [hideModal, resetScannerState]);

  // Stato di loading della camera
  if (!permission) {
    return (
      <View className="flex-1 bg-black items-center justify-center">
        <ActivityIndicator size="large" color="white" style={{ marginBottom: 16 }} />
        <Text className="text-white font-medium">Caricamento fotocamera...</Text>
      </View>
    );
  }

  // Richiesta permessi camera
  if (!permission.granted) {
    return (
      <View className="flex-1 bg-black items-center justify-center px-6">
        <Ionicons name="camera-outline" size={64} color="#6B7280" />
        <Text className="text-white font-semibold text-lg mb-2 text-center">
          Permesso Fotocamera Richiesto
        </Text>
        <Text className="text-white/70 mb-6 text-center">
          È necessario accedere alla fotocamera per scansionare i QR code
        </Text>
        <TouchableOpacity 
          onPress={requestPermission}
          className="bg-teal-500 px-6 py-3 rounded-lg"
        >
          <Text className="text-white font-medium">Concedi Permesso</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Render del componente principale
  return (
    <View className="flex-1 bg-black">
      <StatusBar barStyle="light-content" backgroundColor="black" />
      
      {/* Solo icona back */}
      <TouchableOpacity 
        onPress={handleGoBack}
        className="absolute top-12 left-4 z-50 bg-black/50 p-3 rounded-full"
      >
        <Ionicons name="arrow-back" size={24} color="white" />
      </TouchableOpacity>

      {/* Camera Scanner con overlay integrato */}
      <CameraScanner
        facing={facing}
        scanned={scannerState.scanned}
        onBarCodeScanned={handleBarCodeScanned}
        selectedOperation={scannerState.selectedOperation}
      />

      {/* Tab Selector per scegliere l'operazione */}
      <TabSelector
        selectedOperation={scannerState.selectedOperation}
        onOperationSelect={handleOperationSelect}
      />

      {/* Modal per opzioni manutenzione */}
      <MaintenanceOptionsModal
        visible={modalState.showOptionsModal}
        product={scannerState.foundProduct}
        onClose={() => handleModalClose('showOptionsModal')}
        onSelectOption={() => {}} // Legacy callback, not used anymore
        onSuccess={handleMaintenanceSuccess}
        allowedActions={scannerState.employeePermissions}
      />

      {/* Modal per visualizzazione dati prodotto */}
      <ProductViewModal
        visible={modalState.showProductViewModal}
        product={scannerState.foundProduct}
        onClose={() => handleModalClose('showProductViewModal')}
      />
    </View>
  );
});

ScannerPage.displayName = 'ScannerPage';

export default ScannerPage;