// Reducers per la gestione centralizzata dello stato del scanner
// Sostituisce i 20+ useState con una struttura organizzata e tipizzata

import {
  ProductFormState,
  ProductFormAction,
  ScannerState,
  ScannerAction,
  ModalState,
  ModalAction,
  Product,
} from '../../types/scanner';

// Stato iniziale per il form del prodotto
export const initialProductFormState: ProductFormState = {
  productName: '',
  productType: '',
  notes: '',
  anno: new Date().getFullYear().toString(),
  materialeSupporto: '',
  spessoreSupporto: '',
  wl: '',
  fissaggio: '',
  dimensioni: '',
  materialePellicola: '',
  figuraUrl: '',
  gpsLat: '',
  gpsLng: '',
};

// Reducer per il form del prodotto
export const productFormReducer = (
  state: ProductFormState,
  action: ProductFormAction
): ProductFormState => {
  switch (action.type) {
    case 'SET_FIELD':
      return {
        ...state,
        [action.field]: action.value,
      };

    case 'SET_GPS':
      return {
        ...state,
        gpsLat: action.lat,
        gpsLng: action.lng,
      };

    case 'RESET_FORM':
      return {
        ...initialProductFormState,
        anno: new Date().getFullYear().toString(),
      };

    case 'LOAD_PRODUCT':
      const product = action.product;
      return {
        productName: product.tipo_segnale,
        productType: product.forma,
        notes: product.note || '',
        anno: product.anno.toString(),
        materialeSupporto: product.materiale_supporto,
        spessoreSupporto: product.spessore_supporto.toString(),
        wl: product.wl,
        fissaggio: product.fissaggio,
        dimensioni: product.dimensioni,
        materialePellicola: product.materiale_pellicola,
        figuraUrl: product.figura_url || '',
        gpsLat: product.gps_lat ? product.gps_lat.toString() : '',
        gpsLng: product.gps_lng ? product.gps_lng.toString() : '',
      };

    default:
      return state;
  }
};

// Stato iniziale per il scanner
export const initialScannerState: ScannerState = {
  scanned: false,
  scannedQR: '',
  foundProduct: null,
  productStatus: 'not installed',
  employeePermissions: [],
  selectedOperation: null,
  isLoadingLocation: false,
};

// Reducer per lo stato del scanner
export const scannerReducer = (
  state: ScannerState,
  action: ScannerAction
): ScannerState => {
  switch (action.type) {
    case 'SET_SCANNED':
      return { ...state, scanned: action.scanned };

    case 'SET_SCANNED_QR':
      return { ...state, scannedQR: action.qr };

    case 'SET_FOUND_PRODUCT':
      return { ...state, foundProduct: action.product };

    case 'SET_PRODUCT_STATUS':
      return { ...state, productStatus: action.status };

    case 'SET_EMPLOYEE_PERMISSIONS':
      return { ...state, employeePermissions: action.permissions };

    case 'SET_SELECTED_OPERATION':
      return { ...state, selectedOperation: action.operation };

    case 'SET_LOADING_LOCATION':
      return { ...state, isLoadingLocation: action.loading };

    case 'RESET_SCANNER':
      return {
        ...initialScannerState,
        selectedOperation: state.selectedOperation, // Mantieni l'operazione selezionata
      };

    default:
      return state;
  }
};

// Stato iniziale per i modal
export const initialModalState: ModalState = {
  showModal: false,
  showOptionsModal: false,
  showOperationSelector: false,
  showProductViewModal: false,
};

// Reducer per i modal
export const modalReducer = (
  state: ModalState,
  action: ModalAction
): ModalState => {
  switch (action.type) {
    case 'SHOW_MODAL':
      return { ...state, [action.modalType]: true };

    case 'HIDE_MODAL':
      return { ...state, [action.modalType]: false };

    case 'RESET_MODALS':
      return { ...initialModalState };

    default:
      return state;
  }
};

// Helper functions per azioni comuni
export const createFormFieldAction = (
  field: keyof ProductFormState,
  value: string
): ProductFormAction => ({
  type: 'SET_FIELD',
  field,
  value,
});

export const createGpsAction = (lat: string, lng: string): ProductFormAction => ({
  type: 'SET_GPS',
  lat,
  lng,
});

export const createScanAction = (scanned: boolean): ScannerAction => ({
  type: 'SET_SCANNED',
  scanned,
});

export const createProductAction = (product: Product | null): ScannerAction => ({
  type: 'SET_FOUND_PRODUCT',
  product,
});

export const createModalAction = (
  modalType: keyof ModalState,
  show: boolean
): ModalAction => ({
  type: show ? 'SHOW_MODAL' : 'HIDE_MODAL',
  modalType,
});