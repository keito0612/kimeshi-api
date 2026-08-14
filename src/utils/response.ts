import type { Context } from 'hono'

export class ApiResponse {
  // 200 OK
  static ok<T>(c: Context, data: T) {
    return c.json(data, 200)
  }

  // 201 Created
  static created<T>(c: Context, data: T) {
    return c.json(data, 201)
  }

  // 200 OK - 成功フラグのみ返す
  static success(c: Context) {
    return c.json({ success: true }, 200)
  }

  // 200 OK - 空配列を返す（リストが空の場合）
  static empty<K extends string>(c: Context, key: K) {
    return c.json({ [key]: [] }, 200)
  }
}
