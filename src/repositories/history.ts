import { getPrisma } from '../db/client'
import type { CreateHistory, History } from '../schemas/history'

export class HistoryRepository {
  async create(userId: string, data: CreateHistory): Promise<History> {
    const prisma = getPrisma()

    const history = await prisma.history.create({
      data: {
        userId,
        restaurantId: data.restaurant_id,
        restaurantName: data.restaurant_name,
        restaurantData: JSON.stringify(data.restaurant_data),
        action: data.action,
      },
    })

    return {
      id: history.id,
      user_id: history.userId,
      restaurant_id: history.restaurantId,
      restaurant_name: history.restaurantName,
      restaurant_data: JSON.parse(history.restaurantData),
      action: history.action as 'selected' | 'skipped',
      created_at: history.createdAt.toISOString(),
    }
  }

  async findByUserId(userId: string, limit = 50): Promise<History[]> {
    const prisma = getPrisma()

    const histories = await prisma.history.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    })

    return histories.map((history) => ({
      id: history.id,
      user_id: history.userId,
      restaurant_id: history.restaurantId,
      restaurant_name: history.restaurantName,
      restaurant_data: JSON.parse(history.restaurantData),
      action: history.action as 'selected' | 'skipped',
      created_at: history.createdAt.toISOString(),
    }))
  }

  async delete(id: string, userId: string): Promise<boolean> {
    const prisma = getPrisma()

    try {
      await prisma.history.delete({
        where: {
          id,
          userId,
        },
      })
      return true
    } catch {
      return false
    }
  }
}
