// Custom hook per la gestione centralizzata dei modal
// Coordina l'apertura/chiusura dei modal e previene conflitti

import { useReducer, useCallback, useMemo } from 'react';
import { ModalState, UseModalManagerReturn } from '../../types/scanner';
import { modalReducer, initialModalState, createModalAction } from './useReducers';

export const useModalManager = (): UseModalManagerReturn => {
  const [modalState, modalDispatch] = useReducer(modalReducer, initialModalState);

  // Mostra un modal specifico
  const showModal = useCallback((modalType: keyof ModalState) => {
    modalDispatch(createModalAction(modalType, true));
  }, []);

  // Nascondi un modal specifico
  const hideModal = useCallback((modalType: keyof ModalState) => {
    modalDispatch(createModalAction(modalType, false));
  }, []);

  // Reset di tutti i modal
  const resetModals = useCallback(() => {
    modalDispatch({ type: 'RESET_MODALS' });
  }, []);

  // Mostra solo un modal alla volta (chiude gli altri)
  const showModalExclusive = useCallback((modalType: keyof ModalState) => {
    // Prima chiudi tutti i modal
    modalDispatch({ type: 'RESET_MODALS' });
    // Poi apri quello richiesto
    setTimeout(() => {
      modalDispatch(createModalAction(modalType, true));
    }, 50); // Piccolo delay per evitare conflitti di animazione
  }, []);

  // Helper per verificare se almeno un modal è aperto
  const hasOpenModal = useMemo(() => {
    return Object.values(modalState).some(isOpen => isOpen);
  }, [modalState]);

  // Helper per ottenere il modal attualmente aperto (se ce n'è solo uno)
  const currentOpenModal = useMemo(() => {
    const openModals = Object.entries(modalState)
      .filter(([_, isOpen]) => isOpen)
      .map(([modalType, _]) => modalType as keyof ModalState);
    
    return openModals.length === 1 ? openModals[0] : null;
  }, [modalState]);

  // Helper per ottenere tutti i modal aperti
  const openModals = useMemo(() => {
    return Object.entries(modalState)
      .filter(([_, isOpen]) => isOpen)
      .map(([modalType, _]) => modalType as keyof ModalState);
  }, [modalState]);

  // Gestione speciale per modal che non possono essere chiusi dal background
  const showNonDismissableModal = useCallback((modalType: keyof ModalState) => {
    showModalExclusive(modalType);
  }, [showModalExclusive]);

  // Handler per il back button Android (se necessario)
  const handleBackPress = useCallback((): boolean => {
    if (hasOpenModal) {
      // Chiudi il primo modal aperto
      if (currentOpenModal) {
        hideModal(currentOpenModal);
        return true; // Previeni il comportamento di default del back button
      }
    }
    return false; // Permetti il comportamento di default
  }, [hasOpenModal, currentOpenModal, hideModal]);

  // Helper per modal con stati dipendenti
  const showProductRelatedModal = useCallback((
    modalType: 'showOptionsModal' | 'showProductViewModal'
  ) => {
    // Chiudi eventuali altri modal di prodotto aperti
    const productModals: (keyof ModalState)[] = [
      'showOptionsModal',
      'showProductViewModal'
    ];

    productModals.forEach(modal => {
      if (modal !== modalType && modalState[modal]) {
        hideModal(modal);
      }
    });

    // Mostra il modal richiesto
    showModal(modalType);
  }, [modalState, showModal, hideModal]);

  // Helper per gestire la sequenza di modal
  const showModalSequence = useCallback(async (
    sequence: (keyof ModalState)[],
    delay: number = 100
  ) => {
    resetModals();
    
    for (let i = 0; i < sequence.length; i++) {
      if (i > 0) {
        // Attendi prima di mostrare il prossimo modal
        await new Promise(resolve => setTimeout(resolve, delay));
      }
      showModal(sequence[i]);
      
      // Se non è l'ultimo modal, aspetta che venga chiuso
      if (i < sequence.length - 1) {
        await new Promise<void>(resolve => {
          const checkClosed = () => {
            if (!modalState[sequence[i]]) {
              resolve();
            } else {
              setTimeout(checkClosed, 100);
            }
          };
          checkClosed();
        });
      }
    }
  }, [modalState, resetModals, showModal]);

  return {
    modalState,
    modalDispatch,
    showModal,
    hideModal,
    resetModals,
    showModalExclusive,
    showNonDismissableModal,
    showProductRelatedModal,
    showModalSequence,
    handleBackPress,
    hasOpenModal,
    currentOpenModal,
    openModals,
  };
};