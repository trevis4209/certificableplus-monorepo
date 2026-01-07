/**
 * Maintenance Scheduler - Logica di calcolo delle scadenze pellicole retroriflettenti
 * 
 * Sistema di calcolo automatico delle scadenze basato sulle normative italiane
 * per le pellicole retroriflettenti utilizzate nella segnaletica stradale.
 * 
 * **Normative di Riferimento:**
 * - Classe I: 7 anni dalla data di installazione (normativa base)
 * - Classe II: 10 anni dalla data di installazione (standard europeo)
 * - Classe IIs: 12 anni dalla data di installazione (ad alta prestazione)
 * 
 * **Features:**
 * - Calcolo automatico scadenze basato su classe pellicola
 * - Generazione alert di avvicinamento scadenza (90 giorni prima)
 * - Storico scadenze e manutenzioni programmate
 * - Integration con sistema di notifiche
 * 
 * **Business Logic:**
 * - Data installazione + durata classe = data scadenza
 * - Alert automatici per scadenze imminenti
 * - Prioritizzazione interventi basata su criticità
 * - Calcolo ottimale planning manutenzioni
 * 
 * **TODO:** Integration con sistema notifiche push, calendar export
 */

export interface ScadenzaInfo {
  productId: string;
  qrCode: string;
  dataInstallazione: string; // ISO date string
  classPellicola: 'classe-1' | 'classe-2' | 'classe-IIs' | 'classe-I' | 'classe-II';
  dataScadenza: string; // ISO date string calcolata
  giorniRimanenti: number; // Giorni alla scadenza
  priorita: 'bassa' | 'media' | 'alta' | 'critica';
  statusAlert: 'ok' | 'warning' | 'critical' | 'expired';
  tipologiaIntervento: 'verifica' | 'sostituzione';
}

export interface NotificaScadenza {
  id: string;
  productId: string;
  message: string;
  tipo: 'info' | 'warning' | 'critical';
  dataInvio: string;
  letta: boolean;
  azione: 'programma_manutenzione' | 'verifica_stato' | 'sostituzione_pellicola';
}

/**
 * Mapping delle durate per classe di pellicola secondo normative italiane
 */
const DURATE_PELLICOLE: Record<string, number> = {
  'classe-1': 7,   // 7 anni
  'classe-I': 7,   // 7 anni (formato alternativo)
  'classe-2': 10,  // 10 anni
  'classe-II': 10, // 10 anni (formato alternativo)
  'classe-IIs': 12 // 12 anni (alta prestazione)
};

/**
 * Calcola la data di scadenza basata sulla classe di pellicola
 * @param dataInstallazione Data ISO di installazione del prodotto
 * @param classPellicola Classe della pellicola retroriflettente
 * @returns Data di scadenza ISO string
 */
export function calcolaDataScadenza(
  dataInstallazione: string, 
  classPellicola: string
): string {
  const installDate = new Date(dataInstallazione);
  const durataAnni = DURATE_PELLICOLE[classPellicola] || 10; // Default 10 anni
  
  // Aggiungi gli anni alla data di installazione
  const scadenzaDate = new Date(installDate);
  scadenzaDate.setFullYear(scadenzaDate.getFullYear() + durataAnni);
  
  return scadenzaDate.toISOString();
}

/**
 * Calcola i giorni rimanenti alla scadenza
 * @param dataScadenza Data ISO di scadenza
 * @returns Numero di giorni (negativo se scaduto)
 */
export function calcolaGiorniRimanenti(dataScadenza: string): number {
  const oggi = new Date();
  const scadenza = new Date(dataScadenza);
  const diffTime = scadenza.getTime() - oggi.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
}

/**
 * Determina la priorità dell'intervento basata sui giorni rimanenti
 * @param giorniRimanenti Giorni alla scadenza
 * @returns Livello di priorità
 */
export function determinaPriorita(giorniRimanenti: number): ScadenzaInfo['priorita'] {
  if (giorniRimanenti < 0) return 'critica';     // Scaduto
  if (giorniRimanenti <= 30) return 'alta';      // Entro 30 giorni
  if (giorniRimanenti <= 90) return 'media';     // Entro 90 giorni
  return 'bassa';                                 // Oltre 90 giorni
}

/**
 * Determina lo status di alert basato sui giorni rimanenti
 * @param giorniRimanenti Giorni alla scadenza
 * @returns Status dell'alert
 */
export function determinaStatusAlert(giorniRimanenti: number): ScadenzaInfo['statusAlert'] {
  if (giorniRimanenti < 0) return 'expired';     // Scaduto
  if (giorniRimanenti <= 30) return 'critical';  // Critico (30 giorni)
  if (giorniRimanenti <= 90) return 'warning';   // Warning (90 giorni)
  return 'ok';                                    // OK (oltre 90 giorni)
}

/**
 * Determina il tipo di intervento raccomandato
 * @param giorniRimanenti Giorni alla scadenza
 * @param classPellicola Classe della pellicola
 * @returns Tipo di intervento raccomandato
 */
export function determinaTipoIntervento(
  giorniRimanenti: number, 
  classPellicola: string
): ScadenzaInfo['tipologiaIntervento'] {
  // Se scaduto o critico, raccomanda sostituzione
  if (giorniRimanenti <= 30) return 'sostituzione';
  
  // Per pellicole di classe alta, verifica prima di sostituzione
  if (classPellicola.includes('IIs') && giorniRimanenti <= 180) {
    return 'verifica';
  }
  
  // Default: verifica per controllo stato
  return 'verifica';
}

/**
 * Calcola informazioni complete di scadenza per un prodotto
 * @param productId ID del prodotto
 * @param qrCode QR code del prodotto
 * @param dataInstallazione Data ISO di installazione
 * @param classPellicola Classe della pellicola
 * @returns Oggetto ScadenzaInfo completo
 */
export function calcolaScadenzaCompleta(
  productId: string,
  qrCode: string,
  dataInstallazione: string,
  classPellicola: string
): ScadenzaInfo {
  const dataScadenza = calcolaDataScadenza(dataInstallazione, classPellicola);
  const giorniRimanenti = calcolaGiorniRimanenti(dataScadenza);
  const priorita = determinaPriorita(giorniRimanenti);
  const statusAlert = determinaStatusAlert(giorniRimanenti);
  const tipologiaIntervento = determinaTipoIntervento(giorniRimanenti, classPellicola);

  return {
    productId,
    qrCode,
    dataInstallazione,
    classPellicola: classPellicola as ScadenzaInfo['classPellicola'],
    dataScadenza,
    giorniRimanenti,
    priorita,
    statusAlert,
    tipologiaIntervento
  };
}

/**
 * Genera messaggio di notifica basato sullo stato della scadenza
 * @param scadenza Informazioni sulla scadenza
 * @param tipoNotifica Tipo di notifica da generare
 * @returns Messaggio formattato per la notifica
 */
export function generaMessaggioNotifica(
  scadenza: ScadenzaInfo,
  tipoNotifica: 'reminder' | 'alert' | 'critical' = 'reminder'
): string {
  const prodotto = `Prodotto ${scadenza.qrCode}`;
  const scadenzaFormatted = new Date(scadenza.dataScadenza).toLocaleDateString('it-IT');
  
  switch (tipoNotifica) {
    case 'critical':
      if (scadenza.giorniRimanenti < 0) {
        return `🚨 SCADUTO: ${prodotto} - Pellicola ${scadenza.classPellicola} scaduta il ${scadenzaFormatted}. Intervento urgente richiesto.`;
      }
      return `⚠️ CRITICO: ${prodotto} - Pellicola ${scadenza.classPellicola} scade tra ${scadenza.giorniRimanenti} giorni (${scadenzaFormatted}). Pianificare intervento immediato.`;
    
    case 'alert':
      return `📅 ALERT: ${prodotto} - Pellicola ${scadenza.classPellicola} scade il ${scadenzaFormatted} (${scadenza.giorniRimanenti} giorni). Programmare ${scadenza.tipologiaIntervento}.`;
    
    case 'reminder':
    default:
      return `🔔 REMINDER: ${prodotto} - Pellicola ${scadenza.classPellicola} scade il ${scadenzaFormatted}. ${scadenza.tipologiaIntervento} raccomandato.`;
  }
}

/**
 * Filtra e ordina le scadenze per priorità
 * @param scadenze Array di scadenze
 * @param filtro Filtro per status alert
 * @returns Scadenze filtrate e ordinate per priorità
 */
export function filtraScadenzePerPriorita(
  scadenze: ScadenzaInfo[],
  filtro?: ScadenzaInfo['statusAlert']
): ScadenzaInfo[] {
  let filteredScadenze = scadenze;
  
  // Applica filtro se specificato
  if (filtro) {
    filteredScadenze = scadenze.filter(s => s.statusAlert === filtro);
  }
  
  // Ordina per priorità e poi per giorni rimanenti
  const priorityOrder = { 'critica': 0, 'alta': 1, 'media': 2, 'bassa': 3 };
  
  return filteredScadenze.sort((a, b) => {
    // Prima per priorità
    const priorityDiff = priorityOrder[a.priorita] - priorityOrder[b.priorita];
    if (priorityDiff !== 0) return priorityDiff;
    
    // Poi per giorni rimanenti (più vicini prima)
    return a.giorniRimanenti - b.giorniRimanenti;
  });
}

/**
 * Genera statistiche sulle scadenze per dashboard
 * @param scadenze Array di scadenze
 * @returns Oggetto con statistiche aggregate
 */
export function generaStatisticheScadenze(scadenze: ScadenzaInfo[]) {
  const totali = scadenze.length;
  const scadute = scadenze.filter(s => s.statusAlert === 'expired').length;
  const critiche = scadenze.filter(s => s.statusAlert === 'critical').length;
  const warning = scadenze.filter(s => s.statusAlert === 'warning').length;
  const ok = scadenze.filter(s => s.statusAlert === 'ok').length;
  
  const prossimiTrentagiorni = scadenze.filter(s => 
    s.giorniRimanenti >= 0 && s.giorniRimanenti <= 30
  ).length;
  
  const prossimiNovantagiorni = scadenze.filter(s => 
    s.giorniRimanenti > 30 && s.giorniRimanenti <= 90
  ).length;

  return {
    totali,
    scadute,
    critiche,
    warning,
    ok,
    prossimiTrentagiorni,
    prossimiNovantagiorni,
    percentualeScadute: totali > 0 ? (scadute / totali * 100).toFixed(1) : '0.0',
    percentualeCritiche: totali > 0 ? ((scadute + critiche) / totali * 100).toFixed(1) : '0.0'
  };
}

/**
 * Ottimizza il planning delle manutenzioni per efficienza territoriale
 * @param scadenze Array di scadenze con coordinate GPS
 * @param maxDistanzaKm Distanza massima per raggruppamento (default 5km)
 * @returns Gruppi di interventi ottimizzati per area geografica
 */
export function ottimizzaPlanningTerritoriale(
  scadenze: (ScadenzaInfo & { gps_lat?: number; gps_lng?: number })[],
  maxDistanzaKm: number = 5
): Array<{
  area: string;
  scadenze: ScadenzaInfo[];
  prioritaMedia: number;
  coordinateCenter: { lat: number; lng: number };
  stimaGiorni: number;
}> {
  // Questa è una implementazione semplificata
  // In produzione si userebbe un algoritmo di clustering geografico
  
  const gruppi: Array<{
    area: string;
    scadenze: ScadenzaInfo[];
    prioritaMedia: number;
    coordinateCenter: { lat: number; lng: number };
    stimaGiorni: number;
  }> = [];
  
  // Per ora raggruppa per città (implementazione base)
  const gruppiPerArea = scadenze.reduce((acc, scadenza) => {
    const area = scadenza.gps_lat && scadenza.gps_lng 
      ? `Area ${scadenza.gps_lat.toFixed(2)}_${scadenza.gps_lng.toFixed(2)}`
      : 'Area_Sconosciuta';
    
    if (!acc[area]) {
      acc[area] = [];
    }
    acc[area].push(scadenza);
    return acc;
  }, {} as Record<string, typeof scadenze>);

  Object.entries(gruppiPerArea).forEach(([area, scadenzeArea]) => {
    const priorityValues = { 'bassa': 1, 'media': 2, 'alta': 3, 'critica': 4 };
    const prioritaMedia = scadenzeArea.reduce((sum, s) => sum + priorityValues[s.priorita], 0) / scadenzeArea.length;
    
    // Calcola coordinate centro (media semplice)
    const coordsValide = scadenzeArea.filter(s => s.gps_lat && s.gps_lng);
    const lat = coordsValide.length > 0 
      ? coordsValide.reduce((sum, s) => sum + s.gps_lat!, 0) / coordsValide.length
      : 0;
    const lng = coordsValide.length > 0
      ? coordsValide.reduce((sum, s) => sum + s.gps_lng!, 0) / coordsValide.length
      : 0;
    
    // Stima giorni per completare l'area (circa 2 interventi per giorno)
    const stimaGiorni = Math.ceil(scadenzeArea.length / 2);

    gruppi.push({
      area,
      scadenze: scadenzeArea,
      prioritaMedia,
      coordinateCenter: { lat, lng },
      stimaGiorni
    });
  });

  // Ordina per priorità media (più alta prima)
  return gruppi.sort((a, b) => b.prioritaMedia - a.prioritaMedia);
}