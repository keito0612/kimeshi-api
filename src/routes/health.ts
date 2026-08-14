import { Hono } from 'hono'
import { ApiResponse } from '../utils/response'

export const healthRoute = new Hono()

healthRoute.get('/', (c) => {
  return ApiResponse.ok(c, {
    status: 'ok',
    timestamp: new Date().toISOString(),
  })
})
