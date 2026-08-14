import type { ContentfulStatusCode } from 'hono/utils/http-status'

export class ApiError extends Error {
  constructor(
    public status: ContentfulStatusCode,
    public code: string,
    message: string
  ) {
    super(message)
    this.name = 'ApiError'
  }

  // よく使うエラーの静的ファクトリメソッド
  static badRequest(code: string, message: string) {
    return new ApiError(400, code, message)
  }

  static unauthorized(code: string, message: string) {
    return new ApiError(401, code, message)
  }

  static notFound(code: string, message: string) {
    return new ApiError(404, code, message)
  }

  static internal(code: string, message: string) {
    return new ApiError(500, code, message)
  }
}
