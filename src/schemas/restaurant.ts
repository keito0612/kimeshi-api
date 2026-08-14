import { z } from 'zod'

export const suggestQuerySchema = z.object({
  lat: z.coerce.number().min(-90).max(90),
  lng: z.coerce.number().min(-180).max(180),
  budget: z.enum(['1000', '2000', '3000', 'unlimited']).optional(),
  genre: z.string().optional(),
  radius: z.coerce.number().min(100).max(3000).default(1000),
  exclude: z.string().optional(),
})

export const restaurantSchema = z.object({
  id: z.string(),
  name: z.string(),
  address: z.string(),
  lat: z.number(),
  lng: z.number(),
  budget: z.string(),
  genre: z.string(),
  image_url: z.string().url().nullable(),
  hotpepper_url: z.string().url(),
})

export type SuggestQuery = z.infer<typeof suggestQuerySchema>
export type Restaurant = z.infer<typeof restaurantSchema>
