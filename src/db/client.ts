import { createClient } from '@libsql/client'
import { PrismaLibSQL } from '@prisma/adapter-libsql'
import { PrismaClient } from '@prisma/client'

let prisma: PrismaClient | null = null

export type DbEnv = {
  NODE_ENV?: string
  TURSO_DATABASE_URL?: string
  TURSO_AUTH_TOKEN?: string
}

export function getPrisma(env: DbEnv = {}): PrismaClient {
  if (prisma) return prisma

  const isDevelopment = env.NODE_ENV !== 'production'

  if (isDevelopment && !env.TURSO_DATABASE_URL) {
    // 開発環境: ローカルSQLiteを使用
    const libsql = createClient({
      url: 'file:./prisma/dev.db',
    })
    const adapter = new PrismaLibSQL(libsql)
    prisma = new PrismaClient({ adapter })
  } else {
    // 本番環境: Tursoを使用
    const url = env.TURSO_DATABASE_URL
    const authToken = env.TURSO_AUTH_TOKEN

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
