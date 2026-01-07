import { z } from "zod";

/**
 * Maintenance Validation Schema
 * Matches @certplus/types Maintenance interface (dual-language strategy)
 */

export const maintenanceSchema = z.object({
  productId: z.string().min(1, "ID prodotto richiesto"),
  tipo_intervento: z.enum(['installazione', 'manutenzione', 'sostituzione', 'verifica', 'dismissione']),
  anno: z.number().min(1900, "Anno richiesto").max(new Date().getFullYear(), "Anno non valido"),
  gps_lat: z.number({ message: "Coordinate GPS obbligatorie" }),
  gps_lng: z.number({ message: "Coordinate GPS obbligatorie" }),
  causale: z.string().min(1, "Causale richiesta"),
  certificato_numero: z.string().min(1, "Numero certificato richiesto"),
  tipologia_installazione: z.string().optional(),
  note: z.string().min(1, "Note richieste"),
  foto_urls: z.array(z.string()).optional(),
});

export type MaintenanceInput = z.infer<typeof maintenanceSchema>;
