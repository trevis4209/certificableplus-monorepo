// Custom hook per le operazioni del scanner
// Gestisce la logica di business per diverse operazioni di scansione

import { useCallback, useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { Product, ScanOperation, UseScannerOperationsReturn } from '../../types/scanner';
import { backendAPI } from '../../lib/api/backend';
import { mapProductDataToProduct } from '../../lib/api/mappers';
import { useAuth } from '../../contexts/AuthContext';
import { useMaintenances } from '../useMaintenance';
import { extractQRCode } from '../../utils/qr-utils';

interface UseScannerOperationsProps {
  selectedOperation: ScanOperation | null;
  setFoundProduct: (product: Product | null) => void;
  setProductStatus: (status: 'not installed' | 'installed') => void;
  setEmployeePermissions: (permissions: string[]) => void;
  setScanned: (scanned: boolean) => void;
  showModal: (modalType: string) => void;
  showOptionsModal: () => void;
  showProductViewModal: () => void;
}

export const useScannerOperations = ({
  selectedOperation,
  setFoundProduct,
  setProductStatus,
  setEmployeePermissions,
  setScanned,
  showModal,
  showOptionsModal,
  showProductViewModal,
}: UseScannerOperationsProps): UseScannerOperationsReturn => {
  const { user } = useAuth();
  const userId = user?.id || 'default-user';
  const [isLoading, setIsLoading] = useState(false);
  const [allProducts, setAllProducts] = useState<Product[]>([]);

  // Get all maintenances to determine product status
  const { maintenances } = useMaintenances(userId);

  // Carica tutti i prodotti dal backend all'avvio
  useEffect(() => {
    const loadProducts = async () => {
      try {
        const products = await backendAPI.getAllProducts();
        const mappedProducts = products.map(p =>
          mapProductDataToProduct(p, user?.companyId || '')
        );
        setAllProducts(mappedProducts);
      } catch (error) {
        console.error('Error loading products:', error);
      }
    };

    loadProducts();
  }, [user?.companyId]);

  // Trova prodotto per QR code (supports both URL and direct code formats)
  const findProductByQRCode = useCallback((qr: string): Product | null => {
    if (!qr) return null;

    // Extract the code from URL if necessary
    const extractedCode = extractQRCode(qr);

    // Try to find product by matching either:
    // 1. Extracted code matches product qr_code
    // 2. Original qr matches product qr_code (backward compatibility)
    return allProducts.find(p =>
      p.qr_code === extractedCode || p.qr_code === qr
    ) || null;
  }, [allProducts]);

  // Logica per visualizzare un prodotto esistente
  const handleViewProduct = useCallback(async (product: Product | null, qr: string) => {
    // Prima controlla nel cache locale
    let foundProduct = findProductByQRCode(qr);

    // Se non trovato localmente, prova a ricaricare dal backend
    if (!foundProduct) {
      try {
        setIsLoading(true);
        const products = await backendAPI.getAllProducts();
        const mappedProducts = products.map(p =>
          mapProductDataToProduct(p, user?.companyId || '')
        );
        setAllProducts(mappedProducts);
        foundProduct = mappedProducts.find(p => p.qr_code === extractQRCode(qr)) || null;
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setIsLoading(false);
      }
    }

    if (foundProduct) {
      setFoundProduct(foundProduct);
      showProductViewModal();
    } else {
      Alert.alert(
        'Prodotto Non Trovato',
        `Il QR code "${qr}" non corrisponde a nessun prodotto registrato nel sistema.`,
        [{ text: 'OK', onPress: () => setScanned(false) }]
      );
    }
  }, [setFoundProduct, showProductViewModal, setScanned, findProductByQRCode, user?.companyId]);

  // Logica per creare un nuovo prodotto
  const handleCreateProduct = useCallback(async (product: Product | null, qr: string) => {
    // Prima controlla nel cache locale
    let foundProduct = findProductByQRCode(qr);

    // Se non trovato localmente, prova a ricaricare dal backend
    if (!foundProduct) {
      try {
        setIsLoading(true);
        const products = await backendAPI.getAllProducts();
        const mappedProducts = products.map(p =>
          mapProductDataToProduct(p, user?.companyId || '')
        );
        setAllProducts(mappedProducts);
        foundProduct = mappedProducts.find(p => p.qr_code === extractQRCode(qr)) || null;
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setIsLoading(false);
      }
    }

    if (foundProduct) {
      Alert.alert(
        'Prodotto Già Esistente',
        `Il QR code "${qr}" è già associato al prodotto: ${foundProduct.tipo_segnale} (${foundProduct.wl})`,
        [{ text: 'OK', onPress: () => setScanned(false) }]
      );
    } else {
      // Prodotto non trovato - mostra modal per creazione
      setFoundProduct(null);
      showModal('showModal');
    }
  }, [setFoundProduct, showModal, setScanned, findProductByQRCode, user?.companyId]);

  // Determina lo stato del prodotto basato sulle manutenzioni reali
  const determineProductStatus = useCallback((productId: string): 'not installed' | 'installed' => {
    const productMaintenances = maintenances.filter(m => m.productId === productId);
    const hasInstallation = productMaintenances.some(m => m.tipo_intervento === 'installazione');
    const hasDismission = productMaintenances.some(m => m.tipo_intervento === 'dismissione');

    if (hasDismission) {
      return 'not installed';
    } else if (hasInstallation) {
      return 'installed';
    } else {
      return 'not installed';
    }
  }, [maintenances]);

  // Logica per aggiungere un intervento
  const handleAddIntervention = useCallback(async (product: Product | null, qr: string) => {
    // Prima controlla nel cache locale
    let foundProduct = product || findProductByQRCode(qr);

    // Se non trovato localmente, prova a ricaricare dal backend
    if (!foundProduct) {
      try {
        setIsLoading(true);
        const products = await backendAPI.getAllProducts();
        const mappedProducts = products.map(p =>
          mapProductDataToProduct(p, user?.companyId || '')
        );
        setAllProducts(mappedProducts);
        foundProduct = mappedProducts.find(p => p.qr_code === extractQRCode(qr)) || null;
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setIsLoading(false);
      }
    }

    // Se ancora non trovato, mostra errore
    if (!foundProduct) {
      Alert.alert(
        'Prodotto Non Trovato',
        `Il QR code "${qr}" non corrisponde a nessun prodotto registrato. Per aggiungere un intervento, il prodotto deve essere già presente nel sistema.`,
        [{ text: 'OK', onPress: () => setScanned(false) }]
      );
      return;
    }

    setFoundProduct(foundProduct);

    // Per ora, tutte le operazioni sono permesse (senza controllo permessi specifici)
    const allPermissions = ['installazione', 'manutenzione', 'verifica', 'sostituzione', 'dismissione'];
    setEmployeePermissions(allPermissions);

    // Determina lo stato del prodotto
    const currentStatus = determineProductStatus(foundProduct.id);
    setProductStatus(currentStatus);

    // Mostra sempre MaintenanceOptionsModal per qualsiasi stato del prodotto
    showOptionsModal();
  }, [setFoundProduct, setEmployeePermissions, setProductStatus, setScanned,
      showOptionsModal, determineProductStatus, findProductByQRCode, user?.companyId]);

  // Logica originale come fallback
  const handleOriginalScanLogic = useCallback((product: Product | null, qr: string) => {
    if (!product) {
      setFoundProduct(null);
      showModal('showModal');
      return;
    }

    setFoundProduct(product);

    // Per ora, tutte le operazioni sono permesse
    const allPermissions = ['installazione', 'manutenzione', 'verifica', 'sostituzione', 'dismissione'];
    setEmployeePermissions(allPermissions);

    const currentStatus = determineProductStatus(product.id);
    setProductStatus(currentStatus);

    // Mostra sempre MaintenanceOptionsModal per qualsiasi stato del prodotto
    showOptionsModal();
  }, [setFoundProduct, setEmployeePermissions, setProductStatus, setScanned,
      showModal, showOptionsModal, determineProductStatus]);

  return {
    handleViewProduct,
    handleCreateProduct,
    handleAddIntervention,
    handleOriginalScanLogic,
  };
};