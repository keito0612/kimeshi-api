import { z } from 'zod'

export const createHistorySchema = z.object({
  restaurant_id: z.string(),
  restaurant_name: z.string(),
  restaurant_data: z.record(z.unknown()),
  action: z.enum(['selected', 'skipped']),
})

export const historySchema = z.object({
  id: z.string(),
  user_id: z.string(),
  restaurant_id: z.string(),
  restaurant_name: z.string(),
  restaurant_data: z.record(z.unknown()),
  action: z.enum(['selected', 'skipped']),
  created_at: z.string(),
})

export type CreateHistory = z.infer<typeof createHistorySchema>
export type History = z.infer<typeof historySchema>
