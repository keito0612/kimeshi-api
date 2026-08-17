/**
 * 環境変数を取得するヘルパー
 * Cloudflare Workers (c.env) とローカル環境 (process.env) の両方に対応
 */
export function getEnv(
  cloudflareEnv?: Record<string, any | undefined>
): Record<string, any | undefined> {
  return {
    ...process.env,
    ...cloudflareEnv,
  }
}
