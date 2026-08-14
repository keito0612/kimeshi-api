import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { createHistorySchema } from '../schemas/history'
import { HistoryRepository } from '../repositories/history'
import { UserRepository } from '../repositories/user'
import { ApiError } from '../utils/error'
import { ApiResponse } from '../utils/response'

export const historyRoute = new Hono()

const historyRepo = new HistoryRepository()
const userRepo = new UserRepository()

// 履歴一覧取得
historyRoute.get('/', async (c) => {
  const deviceId = c.req.header('X-Device-ID')

  if (!deviceId) {
    throw ApiError.badRequest('MISSING_DEVICE_ID', 'X-Device-ID header is required')
  }

  const user = await userRepo.findByDeviceId(deviceId)

  if (!user) {
    return ApiResponse.empty(c, 'history')
  }

  const history = await historyRepo.findByUserId(user.id)
  return ApiResponse.ok(c, { history })
})

// 履歴保存
historyRoute.post('/', zValidator('json', createHistorySchema), async (c) => {
  const deviceId = c.req.header('X-Device-ID')

  if (!deviceId) {
    throw ApiError.badRequest('MISSING_DEVICE_ID', 'X-Device-ID header is required')
  }

  const data = c.req.valid('json')
  const user = await userRepo.findOrCreate(deviceId)
  const history = await historyRepo.create(user.id, data)

  return ApiResponse.created(c, { history })
})

// 履歴削除
historyRoute.delete('/:id', async (c) => {
  const id = c.req.param('id')
  const deviceId = c.req.header('X-Device-ID')

  if (!deviceId) {
    throw ApiError.badRequest('MISSING_DEVICE_ID', 'X-Device-ID header is required')
  }

  const user = await userRepo.findByDeviceId(deviceId)

  if (!user) {
    throw ApiError.notFound('NOT_FOUND', 'User not found')
  }

  const deleted = await historyRepo.delete(id, user.id)

  if (!deleted) {
    throw ApiError.notFound('NOT_FOUND', 'History not found')
  }

  return ApiResponse.success(c)
})
