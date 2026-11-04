import { z } from 'zod';

export const DOC_TYPES = ['qa-audit', 'datalayer-doc', 'tagging-plan', 'gtm-audit', 'cm360-audit'] as const;

/** Tamaño máximo aceptado para un documento (Vercel rechaza cuerpos > ~4,5 MB). */
export const MAX_DOCUMENT_BYTES = 4_000_000;

export const reportIdSchema = z.uuid({ message: 'Identificador de documento inválido.' });

export const saveReportSchema = z
  .object({
    title: z.string().trim().max(300, { message: 'El título es demasiado largo.' }).default(''),
    client: z.string().trim().max(200, { message: 'El nombre del cliente es demasiado largo.' }).default(''),
    reportStatus: z.enum(['draft', 'final'], { message: 'Estado de documento no válido.' }).default('draft'),
    docType: z.enum(DOC_TYPES, { message: 'Tipo de documento no válido.' }),
    // El contenido varía por tipo de documento; se valida el discriminador y se
    // conserva el resto tal cual (el contenido enriquecido se sanitiza al renderizar).
    data: z.looseObject({ docType: z.enum(DOC_TYPES, { message: 'Tipo de documento no válido.' }) }, { message: 'Falta el contenido del documento.' }),
  })
  .refine(v => v.data.docType === v.docType, {
    message: 'El tipo de documento no coincide con su contenido.',
    path: ['data', 'docType'],
  });

export type SaveReportInput = z.infer<typeof saveReportSchema>;

/** Fila del listado de documentos. */
export interface ReportSummary {
  id: string;
  title: string;
  client: string;
  created_at: string;
  updated_at: string;
  report_status: 'draft' | 'final' | null;
  doc_type: (typeof DOC_TYPES)[number] | null;
}
