import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { suggestQuerySchema } from '../schemas/restaurant'
import { HotpepperService } from '../services/hotpepper'
import { ApiError } from '../utils/error'
import { ApiResponse } from '../utils/response'

export const restaurantsRoute = new Hono()

restaurantsRoute.get(
  '/suggest',
  zValidator('query', suggestQuerySchema),
  async (c) => {
    const params = c.req.valid('query')
    const apiKey = process.env.HOTPEPPER_API_KEY

    if (!apiKey) {
      throw ApiError.internal('CONFIG_ERROR', 'HOTPEPPER_API_KEY is not configured')
    }
    const hotpepper = new HotpepperService(apiKey)
    const { restaurants } = await hotpepper.search(params)

    // 除外リストを取得
    const excludeIds = params.exclude ? params.exclude.split(',') : []

    // ランダムに1件選出
    const selected = hotpepper.selectRandom(restaurants, excludeIds)

    if (!selected) {
      return ApiResponse.ok(c, { restaurant: null, remaining_count: 0 })
    }

    // 残り件数を計算
    const remainingCount = restaurants.filter((r) => !excludeIds.includes(r.id)).length - 1

    return ApiResponse.ok(c, {
      restaurant: selected,
      remaining_count: remainingCount,
    })
  }
)

restaurantsRoute.get('/:id', async (c) => {
  const id = c.req.param('id')
  const apiKey = process.env.HOTPEPPER_API_KEY

  if (!apiKey) {
    throw ApiError.internal('CONFIG_ERROR', 'HOTPEPPER_API_KEY is not configured')
  }

  const searchParams = new URLSearchParams({
    key: apiKey,
    id: id,
    format: 'json',
  })

  const response = await fetch(
    `https://webservice.recruit.co.jp/hotpepper/gourmet/v1/?${searchParams.toString()}`
  )

  if (!response.ok) {
    throw ApiError.internal('API_ERROR', `Hotpepper API error: ${response.status}`)
  }

  const data = (await response.json()) as { results: { shop: unknown[] } }
  const shop = data.results.shop?.[0]

  if (!shop) {
    throw ApiError.notFound('NOT_FOUND', 'Restaurant not found')
  }

  return ApiResponse.ok(c, { restaurant: shop })
})
