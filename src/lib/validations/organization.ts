import { z } from 'zod'

export const CreateOrgSchema = z.object({
  name: z.string().min(2, 'Minimo 2 caratteri').max(80),
  slug: z
    .string()
    .min(2, 'Minimo 2 caratteri')
    .max(32, 'Massimo 32 caratteri')
    .regex(/^[a-z0-9-]+$/, 'Solo lettere minuscole, numeri e trattini'),
})

export type CreateOrgInput = z.infer<typeof CreateOrgSchema>
