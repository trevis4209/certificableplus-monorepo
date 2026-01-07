import { z } from "zod";

/**
 * Product Validation Schema
 * Matches @certplus/types Product interface
 */

export const productSchema = z.object({
  tipologia_segnale: z.enum(["permanente", "temporanea"], {
    message: "Tipologia segnale richiesta"
  }),
  tipo_segnale: z.string().min(1, "Tipo segnale richiesto"),
  anno: z.number().min(1900, "Anno non valido").max(new Date().getFullYear(), "Anno non valido"),
  forma: z.string().min(1, "Forma richiesta"),
  dimensioni: z.string().min(1, "Dimensioni richieste"),
  materiale_supporto: z.string().min(1, "Materiale supporto richiesto"),
  spessore_supporto: z.number().positive("Spessore deve essere positivo"),
  wl: z.string().min(1, "WL richiesto"),
  materiale_pellicola: z.string().min(1, "Materiale pellicola richiesto"),
  figura: z.string().optional(),
  figura_url: z.string().optional(),
  qr_code: z.string().min(1, "QR code richiesto"),
  gps_lat: z.number().optional(),
  gps_lng: z.number().optional(),
  fissaggio: z.string().min(1, "Fissaggio richiesto"),
  is_cantieristica_stradale: z.boolean().optional(),
  stato_prodotto: z.enum(['installato', 'dismesso']).optional(),
  data_scadenza: z.string().optional(),
});

export type ProductInput = z.infer<typeof productSchema>;
