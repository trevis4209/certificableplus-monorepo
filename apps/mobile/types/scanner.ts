// Interfacce TypeScript per il sistema scanner
// Definisce tutti i tipi per una gestione sicura e mantenibile

// Importa il Product dall'interfaccia principale e estendiamolo se necessario
import { Product as BaseProduct } from './index';

export interface Product extends BaseProduct {
  note?: string;
}

// Alternative interface per la creazione di nuovi prodotti (senza campi obbligatori)
export interface NewProduct {
  tipo_segnale: string;
  forma: string;
  anno: number;
  materiale_supporto: string;
  spessore_supporto: number;
  wl: string;
  fissaggio: string;
  dimensioni: string;
  materiale_pellicola: string;
  figura_url?: string;
  qr_code: string;
  gps_lat?: number;
  gps_lng?: number;
  note?: string;
}

// Tipi per le operazioni del scanner
export type ScanOperation = 'add_intervention' | 'view_product' | 'create_product';

// Stato del prodotto per le installazioni
export type ProductStatus = 'not installed' | 'installed';

// Tipi per le autorizzazioni degli employee
export type EmployeePermission = 'installazione' | 'revisione' | 'sostituzione' | 'dismissione';

// Stato del form per la creazione prodotti
export interface ProductFormState {
  productName: string;
  productType: string;
  notes: string;
  anno: string;
  materialeSupporto: string;
  spessoreSupporto: string;
  wl: string;
  fissaggio: string;
  dimensioni: string;
  materialePellicola: string;
  figuraUrl: string;
  gpsLat: string;
  gpsLng: string;
}

// Azioni per il reducer del form
export type ProductFormAction =
  | { type: 'SET_FIELD'; field: keyof ProductFormState; value: string }
  | { type: 'SET_GPS'; lat: string; lng: string }
  | { type: 'RESET_FORM' }
  | { type: 'LOAD_PRODUCT'; product: Product };

// Stato principale del scanner
export interface ScannerState {
  scanned: boolean;
  scannedQR: string;
  foundProduct: Product | null;
  productStatus: ProductStatus;
  employeePermissions: EmployeePermission[];
  selectedOperation: ScanOperation | null;
  isLoadingLocation: boolean;
}

// Azioni per il reducer del scanner
export type ScannerAction =
  | { type: 'SET_SCANNED'; scanned: boolean }
  | { type: 'SET_SCANNED_QR'; qr: string }
  | { type: 'SET_FOUND_PRODUCT'; product: Product | null }
  | { type: 'SET_PRODUCT_STATUS'; status: ProductStatus }
  | { type: 'SET_EMPLOYEE_PERMISSIONS'; permissions: EmployeePermission[] }
  | { type: 'SET_SELECTED_OPERATION'; operation: ScanOperation | null }
  | { type: 'SET_LOADING_LOCATION'; loading: boolean }
  | { type: 'RESET_SCANNER' };

// Stato per la gestione dei modal
export interface ModalState {
  showModal: boolean;
  showOptionsModal: boolean;
  showOperationSelector: boolean;
  showProductViewModal: boolean;
}

// Azioni per il reducer dei modal
export type ModalAction =
  | { type: 'SHOW_MODAL'; modalType: keyof ModalState }
  | { type: 'HIDE_MODAL'; modalType: keyof ModalState }
  | { type: 'RESET_MODALS' };

// Configurazione per i campi del form
export interface ProductFormConfig {
  shapes: string[];
  materials: string[];
  filmClasses: string[];
  fixingTypes: string[];
}

// Risultato della validazione del form
export interface ValidationResult {
  isValid: boolean;
  errors: Partial<Record<keyof ProductFormState, string>>;
}

// Opzioni per la localizzazione GPS
export interface LocationOptions {
  timeout?: number;
  enableHighAccuracy?: boolean;
  maximumAge?: number;
}

// Dati per l'installazione (deve combaciare con InstallationModal)
export interface InstallationData {
  notes: string;
  installationDate: string;
  installerName: string;
  photos?: string[];
}

// Parametri di ricerca locale
export interface LocalSearchParams {
  operation?: string;
}

// Props per i componenti estratti
export interface CameraScannerProps {
  facing: 'front' | 'back';
  scanned: boolean;
  onBarCodeScanned: (result: any) => void;
}

export interface OperationSelectorProps {
  visible: boolean;
  onOperationSelect: (operation: ScanOperation) => void;
}

export interface ProductFormProps {
  visible: boolean;
  scannedQR: string;
  selectedOperation: ScanOperation | null;
  onClose: () => void;
  onSubmit: (productData: NewProduct) => void;
}

export interface ProductViewerProps {
  visible: boolean;
  product: Product | null;
  onClose: () => void;
}

export interface ScanOverlayProps {
  scanned: boolean;
  selectedOperation?: ScanOperation | null;
}

// Risultato della scansione QR
export interface ScanResult {
  data: string;
  type: string;
}

// Errori personalizzati per il scanner
export class ScannerError extends Error {
  constructor(
    message: string,
    public code: string,
    public recoverable: boolean = true
  ) {
    super(message);
    this.name = 'ScannerError';
  }
}

export class LocationError extends Error {
  constructor(
    message: string,
    public code: 'PERMISSION_DENIED' | 'POSITION_UNAVAILABLE' | 'TIMEOUT',
    public recoverable: boolean = true
  ) {
    super(message);
    this.name = 'LocationError';
  }
}

// Hook return types
export interface UseScannerOperationsReturn {
  handleViewProduct: (product: Product | null, qr: string) => void;
  handleCreateProduct: (product: Product | null, qr: string) => void;
  handleAddIntervention: (product: Product | null, qr: string) => void;
  handleOriginalScanLogic: (product: Product | null, qr: string) => void;
}

export interface UseProductFormReturn {
  formState: ProductFormState;
  formDispatch: React.Dispatch<ProductFormAction>;
  updateField: (field: keyof ProductFormState, value: string) => void;
  updateGPS: (lat: string, lng: string) => void;
  validateForm: () => ValidationResult;
  validateField: (field: keyof ProductFormState, value: string) => string | null;
  resetForm: () => void;
  loadProduct: (product: Product) => void;
  submitForm: (qr: string) => Promise<NewProduct>;
  isDirty: boolean;
  formConfig: ProductFormConfig;
}

export interface UseLocationServiceReturn {
  getCurrentLocation: () => Promise<{ lat: string; lng: string }>;
  getCurrentLocationSilent: () => Promise<{ lat: string; lng: string } | null>;
  checkPermissions: () => Promise<boolean>;
  isLoading: boolean;
  error: LocationError | null;
}

export interface UseModalManagerReturn {
  modalState: ModalState;
  modalDispatch: React.Dispatch<ModalAction>;
  showModal: (modalType: keyof ModalState) => void;
  hideModal: (modalType: keyof ModalState) => void;
  resetModals: () => void;
  showModalExclusive: (modalType: keyof ModalState) => void;
  showNonDismissableModal: (modalType: keyof ModalState) => void;
  showProductRelatedModal: (modalType: 'showOptionsModal' | 'showProductViewModal') => void;
  showModalSequence: (sequence: (keyof ModalState)[], delay?: number) => Promise<void>;
  handleBackPress: () => boolean;
  hasOpenModal: boolean;
  currentOpenModal: keyof ModalState | null;
  openModals: (keyof ModalState)[];
}