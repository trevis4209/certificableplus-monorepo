import { z } from "zod";

// Auth schemas
export const loginSchema = z.object({
  email: z.string().email("Email non valida"),
  password: z.string().min(6, "La password deve essere di almeno 6 caratteri"),
});

export const registerSchema = z.object({
  name: z.string().min(2, "Il nome deve essere di almeno 2 caratteri"),
  email: z.string().email("Email non valida"),
  password: z.string().min(6, "La password deve essere di almeno 6 caratteri"),
  confirmPassword: z.string(),
  companyName: z.string().min(2, "Il nome dell'azienda deve essere di almeno 2 caratteri"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Le password non coincidono",
  path: ["confirmPassword"],
});

// Product schemas - UPDATED to match new schema
export const productSchema = z.object({
  tipologia_segnale: z.enum(["permanente", "temporanea"], {
    message: "Tipologia segnale richiesta"
  }),
  anno: z.number().min(1900, "Anno non valido").max(new Date().getFullYear(), "Anno non valido"),
  forma: z.string().min(1, "Forma richiesta"),
  dimensioni: z.string().min(1, "Dimensioni richieste"),
  materiale_supporto: z.string().min(1, "Materiale supporto richiesto"),
  spessore_supporto: z.number().positive("Spessore deve essere positivo"),
  wl: z.string().min(1, "WL richiesto"),
  materiale_pellicola: z.string().min(1, "Materiale pellicola richiesto"),
  figura: z.string().optional(),
  qr_code: z.string().min(1, "QR code richiesto"),
  gps_lat: z.number().optional(),
  gps_lng: z.number().optional(),
  fissaggio: z.string().min(1, "Fissaggio richiesto"),
  is_cantieristica_stradale: z.boolean().optional(),
  stato_prodotto: z.enum(['installato', 'dismesso']).optional(),
  data_scadenza: z.string().optional(),
});

// Maintenance schema - UPDATED to match new schema
export const maintenanceSchema = z.object({
  productId: z.string().min(1, "ID prodotto richiesto"),
  tipo_intervento: z.enum(['installazione', 'manutenzione', 'verifica', 'dismissione']),
  anno: z.number().min(1900, "Anno richiesto").max(new Date().getFullYear(), "Anno non valido"),
  gps_lat: z.number({ message: "Coordinate GPS obbligatorie" }),
  gps_lng: z.number({ message: "Coordinate GPS obbligatorie" }),
  causale: z.string().min(1, "Causale richiesta"),
  tipologia_installazione: z.string().optional(),
  note: z.string().optional(),
  foto_urls: z.array(z.string()).optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ProductInput = z.infer<typeof productSchema>;
export type MaintenanceInput = z.infer<typeof maintenanceSchema>;