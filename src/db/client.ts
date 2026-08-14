import { createClient } from '@libsql/client'
import { PrismaLibSQL } from '@prisma/adapter-libsql'
import { PrismaClient } from '@prisma/client'

let prisma: PrismaClient | null = null

const isDevelopment = process.env.NODE_ENV !== 'production'

export function getPrisma(): PrismaClient {
  if (prisma) return prisma

  if (isDevelopment && !process.env.TURSO_DATABASE_URL) {
    // 開発環境: ローカルSQLiteを使用
    const libsql = createClient({
      url: 'file:./prisma/dev.db',
    })
    const adapter = new PrismaLibSQL(libsql)
    prisma = new PrismaClient({ adapter })
  } else {
    // 本番環境: Tursoを使用
    const url = process.env.TURSO_DATABASE_URL
    const authToken = process.env.TURSO_AUTH_TOKEN

    if (!url) {
      throw new Error('TURSO_DATABASE_URL is not configured')
    }

    const libsql = createClient({
      url,
      authToken,
    })
    const adapter = new PrismaLibSQL(libsql)
    prisma = new PrismaClient({ adapter })
  }

  return prisma
}

export async function closePrisma() {
  if (prisma) {
    await prisma.$disconnect()
    prisma = null
  }
}
