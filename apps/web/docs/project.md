# 🎨 _Documento UI/UX – Certificable Plus_

---

## ✅ _Obiettivo del Progetto_

Certificable Plus è una piattaforma web/app dedicata alla _gestione, tracciamento e manutenzione_ di dispositivi certificati (es. segnali stradali, cartellonistica tecnica, ecc.), basata su _QR Code o NFC_.
È rivolta ad aziende che installano o mantengono questi prodotti e ai loro dipendenti operativi.

---

## 👥 _Ruoli Utente_

| Ruolo            | Permessi principali                                        |
| ---------------- | ---------------------------------------------------------- |
| _Azienda_        | Gestione prodotti, dipendenti, manutenzioni, database      |
| _Dipendente_     | Inserimento prodotti, manutenzioni, consultazione database |
| _Visualizzatore_ | Solo accesso in lettura a database e mappa                 |

---

## 🧭 _Architettura Navigazione_

[Login/Register]
↓
[Home Azienda / Home Dipendente]
├── + Aggiungi Prodotto
├── + Aggiungi Manutenzione
├── ≡ Visualizza Database
└── Mappa Segnali

---

## 🏠 _UI – Home Azienda_

_Elementi principali:_

•⁠ ⁠Header con LOGO e NOME AZIENDA
•⁠ ⁠Pulsanti azione (colorati per differenziazione):

- 🔴 ⁠ + Aggiungi Prodotto ⁠
- 🔵 ⁠ + Aggiungi Dipendente ⁠
- 🟢 ⁠ ≡ Visualizza Database ⁠
- 🟣 ⁠ + Aggiungi Manutenzione ⁠

_Layout suggerito:_

•⁠ ⁠Grid centrale con pulsanti azione ben distanziati
•⁠ ⁠Sidebar sinistra con menu (Home, Profilo, Logout)

---

## 🧑‍🔧 _UI – Home Dipendente_

_Elementi principali:_

•⁠ ⁠Header con LOGO e NOME
•⁠ ⁠Pulsanti azione:

- 🔴 ⁠ + Aggiungi Prodotto ⁠
- 🟣 ⁠ + Aggiungi Manutenzione ⁠
- 🟢 ⁠ ≡ Visualizza Database ⁠

_Footer nav:_

•⁠ ⁠⁠ 🏠 Home ⁠
•⁠ ⁠⁠ 👤 Profilo ⁠

---

## 📦 _Funzione: Aggiungi Prodotto_

_Form con i seguenti campi:_

| Campo               | Tipo Input        |
| ------------------- | ----------------- |
| Tipo segnale        | Select / Dropdown |
| Anno                | Number            |
| Forma               | Select / Dropdown |
| Materiale supporto  | Text              |
| Spessore supporto   | Number            |
| WL                  | Text              |
| Fissaggio           | Text              |
| Dimensioni          | Text              |
| Materiale pellicola | Text              |
| Figura (immagine)   | Upload / Gallery  |

_Al termine:_
➡️ Associazione di QR Code o NFC per identificazione univoca.

---

## 🛠️ _Funzione: Manutenzione su prodotto esistente_

_Flusso:_

1.⁠ ⁠Scansione QR Code / NFC
2.⁠ ⁠Scelta tipo intervento:

- Installazione
- Manutenzione
- Sostituzione
- Verifica
- Dismissione
  3.⁠ ⁠Campo note
  4.⁠ ⁠Upload foto
  5.⁠ ⁠Autocompletamento automatico:

- Data/Ora
- Utente registrato
- Posizione GPS

---

## 🗺️ _Mappa Segnali_

_Obiettivo:_
Visualizzare la posizione geolocalizzata dei prodotti installati, con possibilità di filtro e ricerca.

_Funzionalità:_

•⁠ ⁠Marker interattivi (colore per tipo di stato)
•⁠ ⁠Filtro per: tipo segnale, data, stato
•⁠ ⁠Click sul marker → info prodotto + cronologia manutenzioni

---

## 📊 _Database & Esportazione_

_Accesso database_:

•⁠ ⁠Layout tabellare con filtro, ricerca, esporta

_Compatibilità:_

•⁠ ⁠Esportazione / importazione in formato XLS

---

## 🧩 _Componenti UI principali_

| Componente          | Descrizione                               |
| ------------------- | ----------------------------------------- |
| _Pulsante azione_   | Colorato e con icona associata            |
| _Form dinamici_     | Input adattivi in base al tipo di segnale |
| _Scansione QR/NFC_  | Compatibile con mobile                    |
| _Modal conferma_    | Dopo ogni azione importante               |
| _Mappa interattiva_ | Google Maps o Leaflet                     |

---

## 🧪 _Note UX_

•⁠ ⁠Design _mobile-first_, poi adattabile a tablet e desktop.
•⁠ ⁠Pulsanti grandi e riconoscibili per uso in campo (operativi con guanti).
•⁠ ⁠Modalità _offline-ready_ con sincronizzazione successiva (opzionale).
•⁠ ⁠UX semplificata per dipendenti: massimo 2 step per ogni azione.
•⁠ ⁠Differenziazione colori forte per evitare errori.

---
