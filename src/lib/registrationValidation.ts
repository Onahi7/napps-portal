import { z } from 'zod';

export function getAcademicSession(date = new Date()): string {
  const year = date.getUTCFullYear();
  return date.getUTCMonth() >= 8 ? `${year}/${year + 1}` : `${year - 1}/${year}`;
}

export const optionalNumber = z.preprocess(
  (value) => value === '' || value == null || (typeof value === 'number' && Number.isNaN(value))
    ? undefined : Number(value),
  z.number().int('Enter a whole number').min(0, 'Cannot be negative').optional(),
);

export const duesDeclarationSchema = z.object({
  sessionId: z.string().regex(/^\d{4}\/\d{4}$/),
  level: z.enum(['national', 'state', 'zonal']),
  paid: z.literal(true),
});

export type DuesDeclaration = z.infer<typeof duesDeclarationSchema>;
