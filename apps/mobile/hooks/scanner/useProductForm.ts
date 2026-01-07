// Custom hook per la gestione del form prodotti
// Include validazione, debouncing e gestione dello stato del form

import { useReducer, useCallback, useMemo } from 'react';
import { Alert } from 'react-native';
import { 
  ProductFormState, 
  ValidationResult, 
  UseProductFormReturn, 
  NewProduct,
  ProductFormConfig 
} from '../../types/scanner';
import type { Product } from '../../types';
import { 
  productFormReducer, 
  initialProductFormState,
  createFormFieldAction,
  createGpsAction 
} from './useReducers';

// Configurazione dei campi del form
export const PRODUCT_FORM_CONFIG: ProductFormConfig = {
  shapes: ['Triangolare', 'Circolare', 'Quadrata', 'Ottagonale', 'Rettangolare'],
  materials: ['Alluminio', 'PVC', 'Acciaio', 'Policarbonato'],
  filmClasses: ['Classe I', 'Classe II', 'Classe III'],
  fixingTypes: ['Tasselli', 'Palo', 'Staffa', 'Zanche'],
};

// Regole di validazione per i campi
const VALIDATION_RULES = {
  productName: {
    required: true,
    minLength: 3,
    maxLength: 100,
    pattern: /^[a-zA-Z0-9\sàáâäèéêëìíîïòóôöùúûüç\-.,()]+$/,
    message: 'Il tipo segnale deve essere tra 3 e 100 caratteri e contenere solo caratteri validi',
  },
  productType: {
    required: true,
    validValues: PRODUCT_FORM_CONFIG.shapes,
    message: 'Seleziona una forma valida dall\'elenco',
  },
  wl: {
    required: true,
    pattern: /^[A-Z0-9]{2,20}$/,
    message: 'Il codice WL deve essere tra 2 e 20 caratteri alfanumerici maiuscoli',
  },
  anno: {
    required: true,
    min: 1990,
    max: new Date().getFullYear() + 2,
    message: `L'anno deve essere tra 1990 e ${new Date().getFullYear() + 2}`,
  },
  materialeSupporto: {
    required: true,
    validValues: PRODUCT_FORM_CONFIG.materials,
    message: 'Seleziona un materiale valido dall\'elenco',
  },
  dimensioni: {
    required: true,
    pattern: /^\d+(x\d+)?(cm|mm)?(\s*[,-]\s*\d+(x\d+)?(cm|mm)?)*$/,
    message: 'Inserisci dimensioni valide (es: 60x60cm, 90x90)',
  },
  materialePellicola: {
    required: true,
    validValues: PRODUCT_FORM_CONFIG.filmClasses,
    message: 'Seleziona una classe di pellicola valida',
  },
  fissaggio: {
    required: true,
    validValues: PRODUCT_FORM_CONFIG.fixingTypes,
    message: 'Seleziona un tipo di fissaggio valido',
  },
  spessoreSupporto: {
    required: false,
    min: 0.1,
    max: 50,
    message: 'Lo spessore deve essere tra 0.1 e 50 mm',
  },
  gpsLat: {
    required: false,
    pattern: /^-?([0-8]?[0-9](\.[0-9]+)?|90(\.0+)?)$/,
    message: 'Latitudine deve essere tra -90 e 90',
  },
  gpsLng: {
    required: false,
    pattern: /^-?([0-9]{1,2}(\.[0-9]+)?|1[0-7][0-9](\.[0-9]+)?|180(\.0+)?)$/,
    message: 'Longitudine deve essere tra -180 e 180',
  },
};

// Validazione GPS secondo specifiche backend
// Requisiti: max 6 decimali, max 9 cifre totali (inclusi decimali)
const validateGPSCoordinate = (coord: string, type: 'lat' | 'lng'): string | null => {
  if (!coord || coord.trim() === '') return null;

  const num = parseFloat(coord);

  // Validate range
  if (type === 'lat' && (num < -90 || num > 90)) {
    return 'Latitudine deve essere tra -90 e 90';
  }
  if (type === 'lng' && (num < -180 || num > 180)) {
    return 'Longitudine deve essere tra -180 e 180';
  }

  // Format to 6 decimals max
  const formatted = num.toFixed(6);
  const [intPart, decPart] = formatted.replace('-', '').split('.');

  // Check decimals (max 6)
  if (decPart && decPart.length > 6) {
    return 'Coordinate GPS: massimo 6 decimali';
  }

  // Check total digits (max 9 including decimals)
  const totalDigits = intPart.length + (decPart ? decPart.length : 0);
  if (totalDigits > 9) {
    return `Coordinate GPS supera 9 cifre totali (${intPart.length} int + ${decPart?.length || 0} dec = ${totalDigits})`;
  }

  return null;
};

export const useProductForm = (): UseProductFormReturn => {
  const [formState, formDispatch] = useReducer(productFormReducer, initialProductFormState);

  // Funzione di validazione di un singolo campo
  const validateField = useCallback((field: keyof ProductFormState, value: string): string | null => {
    const rule = VALIDATION_RULES[field as keyof typeof VALIDATION_RULES];
    if (!rule) return null;

    // Campo obbligatorio
    if (rule.required && (!value || value.trim() === '')) {
      return `${field} è obbligatorio`;
    }

    // Skip ulteriori validazioni se il campo è vuoto e non obbligatorio
    if (!value || value.trim() === '') {
      return null;
    }

    // Validazione GPS speciale per backend (6 decimali, 9 cifre totali)
    if (field === 'gpsLat') {
      return validateGPSCoordinate(value, 'lat');
    }
    if (field === 'gpsLng') {
      return validateGPSCoordinate(value, 'lng');
    }

    // Lunghezza minima
    if ('minLength' in rule && rule.minLength && value.length < rule.minLength) {
      return rule.message;
    }

    // Lunghezza massima
    if ('maxLength' in rule && rule.maxLength && value.length > rule.maxLength) {
      return rule.message;
    }

    // Pattern regex
    if ('pattern' in rule && rule.pattern && !rule.pattern.test(value)) {
      return rule.message;
    }

    // Valori validi
    if ('validValues' in rule && rule.validValues && !rule.validValues.includes(value)) {
      return rule.message;
    }

    // Validazione numerica
    if ('min' in rule || 'max' in rule) {
      const numValue = parseFloat(value);
      if (isNaN(numValue)) {
        return `${field} deve essere un numero valido`;
      }
      if ('min' in rule && rule.min !== undefined && numValue < rule.min) {
        return rule.message;
      }
      if ('max' in rule && typeof rule.max === 'number' && numValue > rule.max) {
        return rule.message;
      }
    }

    return null;
  }, []);

  // Validazione completa del form
  const validateForm = useCallback((): ValidationResult => {
    const errors: Partial<Record<keyof ProductFormState, string>> = {};
    let isValid = true;

    // Valida tutti i campi
    (Object.keys(formState) as Array<keyof ProductFormState>).forEach(field => {
      const error = validateField(field, formState[field]);
      if (error) {
        errors[field] = error;
        isValid = false;
      }
    });

    // Validazioni personalizzate aggiuntive
    if (formState.gpsLat && !formState.gpsLng) {
      errors.gpsLng = 'Se inserisci la latitudine, devi inserire anche la longitudine';
      isValid = false;
    }
    
    if (formState.gpsLng && !formState.gpsLat) {
      errors.gpsLat = 'Se inserisci la longitudine, devi inserire anche la latitudine';
      isValid = false;
    }

    return { isValid, errors };
  }, [formState, validateField]);

  // Aggiorna un singolo campo del form
  const updateField = useCallback((field: keyof ProductFormState, value: string) => {
    formDispatch(createFormFieldAction(field, value));
  }, []);

  // Aggiorna le coordinate GPS
  const updateGPS = useCallback((lat: string, lng: string) => {
    formDispatch(createGpsAction(lat, lng));
  }, []);

  // Reset del form
  const resetForm = useCallback(() => {
    formDispatch({ type: 'RESET_FORM' });
  }, []);

  // Carica dati da un prodotto esistente
  const loadProduct = useCallback((product: Product) => {
    formDispatch({ type: 'LOAD_PRODUCT', product });
  }, []);

  // Submit del form con validazione
  const submitForm = useCallback(async (qr: string): Promise<NewProduct> => {
    const validation = validateForm();
    
    if (!validation.isValid) {
      const firstError = Object.values(validation.errors)[0];
      Alert.alert('Errore di Validazione', firstError || 'Compila tutti i campi obbligatori');
      throw new Error('Validazione fallita');
    }

    try {
      // Converti i dati del form in un oggetto NewProduct
      const newProduct: NewProduct = {
        tipo_segnale: formState.productName.trim(),
        forma: formState.productType,
        anno: parseInt(formState.anno),
        materiale_supporto: formState.materialeSupporto,
        spessore_supporto: parseFloat(formState.spessoreSupporto) || 2.0,
        wl: formState.wl.trim().toUpperCase(),
        fissaggio: formState.fissaggio,
        dimensioni: formState.dimensioni.trim(),
        materiale_pellicola: formState.materialePellicola,
        figura_url: formState.figuraUrl.trim() || undefined,
        qr_code: qr,
        gps_lat: formState.gpsLat ? parseFloat(formState.gpsLat) : undefined,
        gps_lng: formState.gpsLng ? parseFloat(formState.gpsLng) : undefined,
        note: formState.notes.trim() || undefined,
      };

      return newProduct;
    } catch (error) {
      Alert.alert('Errore', 'Errore nella creazione del prodotto. Verifica i dati inseriti.');
      throw error;
    }
  }, [formState, validateForm]);

  // Memoizza la configurazione del form per evitare re-render
  const formConfig = useMemo(() => PRODUCT_FORM_CONFIG, []);

  // Verifica se il form è stato modificato
  const isDirty = useMemo(() => {
    return Object.keys(formState).some(key => {
      const field = key as keyof ProductFormState;
      return formState[field] !== initialProductFormState[field];
    });
  }, [formState]);

  return {
    formState,
    formDispatch,
    updateField,
    updateGPS,
    validateForm,
    validateField,
    resetForm,
    loadProduct,
    submitForm,
    isDirty,
    formConfig,
  };
};