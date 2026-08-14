# Kimeshi API

「今日何食べる？」を3秒で解決する店舗提案APIです。

## 技術スタック

- **Runtime**: Bun
- **Framework**: Hono
- **Validation**: Zod
- **Database**: Turso (libSQL)
- **External API**: ホットペッパーグルメAPI

## セットアップ

### 環境変数

`.env.example` をコピーして `.env` を作成し、必要な値を設定してください。

```bash
cp .env.example .env
```

### Docker を使う場合（推奨）

```bash
# 起動
docker compose up

# バックグラウンド起動
docker compose up -d

# 停止
docker compose down
```

### ローカルで直接起動する場合

```bash
# Bun をインストール
curl -fsSL https://bun.sh/install | bash

# 依存関係インストール
bun install

# 開発サーバー起動
bun run dev
```

## API エンドポイント

### ヘルスチェック

```
GET /health
```

### 店舗提案

```
GET /restaurants/suggest?lat=35.6812&lng=139.7671&budget=2000&genre=izakaya&radius=1000
```

| パラメータ | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| lat | number | ○ | 緯度 (-90〜90) |
| lng | number | ○ | 経度 (-180〜180) |
| budget | string | - | 予算 (1000/2000/3000/unlimited) |
| genre | string | - | ジャンル |
| radius | number | - | 検索半径 (100〜3000m, デフォルト1000) |
| exclude | string | - | 除外する店舗ID（カンマ区切り） |

### 店舗詳細

```
GET /restaurants/:id
```

### 履歴

```
GET /history
POST /history
DELETE /history/:id
```

※ `X-Device-ID` ヘッダーが必要です。

## デプロイ

### Cloudflare Workers

```bash
bun run deploy
```

## 開発

```bash
# 型チェック
bun run typecheck

# テスト
bun run test
```
