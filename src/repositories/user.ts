import { getPrisma } from '../db/client'

export interface User {
  id: string
  device_id: string
  created_at: string
  updated_at: string
}

export class UserRepository {
  async findByDeviceId(deviceId: string): Promise<User | null> {
    const prisma = getPrisma()

    const user = await prisma.user.findUnique({
      where: { deviceId },
    })

    if (!user) return null

    return {
      id: user.id,
      device_id: user.deviceId,
      created_at: user.createdAt.toISOString(),
      updated_at: user.updatedAt.toISOString(),
    }
  }

  async create(deviceId: string): Promise<User> {
    const prisma = getPrisma()

    const user = await prisma.user.create({
      data: { deviceId },
    })

    return {
      id: user.id,
      device_id: user.deviceId,
      created_at: user.createdAt.toISOString(),
      updated_at: user.updatedAt.toISOString(),
    }
  }

  async findOrCreate(deviceId: string): Promise<User> {
    const existing = await this.findByDeviceId(deviceId)
    if (existing) return existing
    return this.create(deviceId)
  }
}
