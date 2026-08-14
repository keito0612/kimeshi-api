# Kimeshi - アプリ仕様書

## 1. プロジェクト概要

### 1.1 コンセプト
「今ここで何食べる？」を3秒で解決するアプリ

### 1.2 ターゲットユーザー
- 食事場所を決めるのが苦手な人
- 時間がなくてすぐに決めたい人
- 新しい店を開拓したい人

### 1.3 コアバリュー
- **即決**: 1店舗だけ提案、選択肢を絞る
- **シンプル**: 最小限の入力で結果を得る
- **パーソナライズ**: 履歴から学習し精度向上

---

## 2. 機能要件

### 2.1 MVP機能（v1.0）

| 機能 | 説明 | 優先度 |
|------|------|--------|
| 位置情報取得 | 現在地を自動取得 | 必須 |
| 条件入力 | 予算・ジャンル・距離を選択 | 必須 |
| 店舗提案 | 条件に合う1店舗を提案 | 必須 |
| 次候補表示 | 「これじゃない」で別の店を表示 | 必須 |
| 地図連携 | 「ここに決めた」で地図アプリを開く | 必須 |
| 履歴保存 | 選択した店舗を履歴に保存 | 必須 |

### 2.2 将来機能（v1.1以降）

| 機能 | 説明 | バージョン |
|------|------|-----------|
| ユーザー認証 | 匿名認証 / Google認証 | v1.1 |
| お気に入り | 店舗をお気に入り登録 | v1.1 |
| 履歴同期 | 複数デバイス間で同期 | v1.1 |
| SNSシェア | 結果をSNSに共有 | v1.2 |
| グループ対応 | 複数人の好みを考慮 | v2.0 |
| レコメンド改善 | 履歴ベースのパーソナライズ | v2.0 |

---

## 3. 技術スタック

### 3.1 モバイル（Flutter）

| カテゴリ | 技術 |
|---------|------|
| フレームワーク | Flutter |
| 状態管理（Local） | flutter_hooks |
| 状態管理（Global） | Riverpod |
| HTTP通信 | dio |
| 位置情報 | geolocator |
| ローカル保存 | shared_preferences |
| コード生成 | freezed, build_runner |

### 3.2 バックエンド

| カテゴリ | 技術 |
|---------|------|
| ランタイム | Bun（開発）/ Cloudflare Workers（本番） |
| フレームワーク | Hono |
| 言語 | TypeScript |
| バリデーション | Zod |
| ORM | Prisma（@prisma/adapter-libsql使用） |
| データベース | Turso (libSQL) |
| 外部API | ホットペッパーグルメAPI |
| コンテナ | Docker / Docker Compose |

### 3.3 インフラ

| カテゴリ | サービス |
|---------|---------|
| 開発環境 | Docker (Bun) |
| 本番APIホスティング | Cloudflare Workers |
| データベース | Turso |
| モバイル配信 | App Store / Google Play |

---

## 4. アーキテクチャ

### 4.1 全体構成

```
┌─────────────────────────────────────┐
│           Flutter App              │
│      MVVM + Repository + Service   │
└─────────────────┬───────────────────┘
                  │ HTTPS
┌─────────────────▼───────────────────┐
│     Cloudflare Workers (Hono)      │
│         Zod Validation             │
└───────────┬─────────────┬───────────┘
            │             │
┌───────────▼───────┐ ┌───▼───────────┐
│      Turso        │ │  HotPepper    │
│    (Database)     │ │     API       │
└───────────────────┘ └───────────────┘
```

### 4.2 モバイルアーキテクチャ（MVVM + Repository + Service）

```
┌─────────────────────────────────────────────────┐
│                    View                         │
│            Widget + flutter_hooks               │
└─────────────────────┬───────────────────────────┘
                      │ 監視・操作
┌─────────────────────▼───────────────────────────┐
│                 ViewModel                       │
│              Riverpod Provider                  │
│           UI状態管理・エラーハンドリング          │
└─────────────────────┬───────────────────────────┘
                      │ 呼び出し
┌─────────────────────▼───────────────────────────┐
│                  Service                        │
│         ビジネスロジック・Repository連携         │
└─────────────────────┬───────────────────────────┘
                      │ データ取得
┌─────────────────────▼───────────────────────────┐
│                Repository                       │
│         API通信・ローカルストレージ              │
└─────────────────────────────────────────────────┘
```

### 4.3 モバイルディレクトリ構成

```
lib/
├── core/
│   ├── api/
│   │   └── api_client.dart
│   ├── constants/
│   │   └── app_constants.dart
│   ├── exceptions/
│   │   └── app_exception.dart
│   └── utils/
│       └── location_utils.dart
│
├── models/
│   ├── restaurant.dart
│   ├── search_params.dart
│   └── user.dart
│
├── repositories/
│   ├── i_restaurant_repository.dart
│   ├── restaurant_repository.dart
│   ├── i_location_repository.dart
│   ├── location_repository.dart
│   ├── i_history_repository.dart
│   └── history_repository.dart
│
├── services/
│   ├── i_restaurant_search_service.dart
│   └── restaurant_search_service.dart
│
├── viewmodels/
│   ├── search_viewmodel.dart
│   ├── history_viewmodel.dart
│   └── providers.dart
│
├── views/
│   ├── screens/
│   │   ├── home_screen.dart
│   │   ├── result_screen.dart
│   │   └── history_screen.dart
│   └── widgets/
│       ├── budget_selector.dart
│       ├── genre_selector.dart
│       ├── restaurant_card.dart
│       └── loading_indicator.dart
│
└── main.dart

test/
├── mocks/
│   ├── mock_restaurant_repository.dart
│   └── mock_location_repository.dart
├── repositories/
│   └── restaurant_repository_test.dart
├── services/
│   └── restaurant_search_service_test.dart
├── viewmodels/
│   └── search_viewmodel_test.dart
└── views/
    └── home_screen_test.dart
```

### 4.4 バックエンドディレクトリ構成

```
kimeshi-api/
├── src/
│   ├── index.ts
│   ├── routes/
│   │   ├── index.ts
│   │   ├── auth.ts
│   │   ├── restaurants.ts
│   │   └── history.ts
│   ├── services/
│   │   └── hotpepper.ts
│   ├── repositories/
│   │   ├── user.ts
│   │   └── history.ts
│   ├── schemas/
│   │   ├── restaurant.ts
│   │   ├── user.ts
│   │   └── index.ts
│   ├── db/
│   │   ├── client.ts
│   │   └── schema.sql
│   └── utils/
│       └── error.ts
├── docs/
│   └── SPECIFICATION.md
├── docker/
│   └── Dockerfile
├── docker-compose.yml
├── .env.example
├── wrangler.toml
├── package.json
├── tsconfig.json
└── README.md
```

---

## 5. API設計

### 5.1 エンドポイント一覧

| メソッド | パス | 説明 |
|---------|------|------|
| GET | /health | ヘルスチェック |
| GET | /restaurants/suggest | 店舗を1件提案 |
| GET | /restaurants/:id | 店舗詳細取得 |
| POST | /history | 履歴保存 |
| GET | /history | 履歴一覧取得 |
| DELETE | /history/:id | 履歴削除 |

### 5.2 店舗提案API

**リクエスト**
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

**レスポンス**
```json
{
  "restaurant": {
    "id": "J001234567",
    "name": "居酒屋 kimeshi",
    "address": "東京都渋谷区...",
    "lat": 35.6812,
    "lng": 139.7671,
    "budget": "2000〜3000円",
    "genre": "居酒屋",
    "image_url": "https://...",
    "hotpepper_url": "https://..."
  },
  "remaining_count": 15
}
```

### 5.3 Zodスキーマ

```typescript
// schemas/restaurant.ts
import { z } from 'zod'

export const suggestQuerySchema = z.object({
  lat: z.coerce.number().min(-90).max(90),
  lng: z.coerce.number().min(-180).max(180),
  budget: z.enum(['1000', '2000', '3000', 'unlimited']).optional(),
  genre: z.string().optional(),
  radius: z.coerce.number().min(100).max(3000).default(1000),
  exclude: z.string().optional(),
})

export const restaurantSchema = z.object({
  id: z.string(),
  name: z.string(),
  address: z.string(),
  lat: z.number(),
  lng: z.number(),
  budget: z.string(),
  genre: z.string(),
  image_url: z.string().url().nullable(),
  hotpepper_url: z.string().url(),
})

export type SuggestQuery = z.infer<typeof suggestQuerySchema>
export type Restaurant = z.infer<typeof restaurantSchema>
```

---

## 6. データベース設計

### 6.1 Prismaスキーマ

```prisma
generator client {
  provider        = "prisma-client-js"
  previewFeatures = ["driverAdapters"]
}

datasource db {
  provider = "sqlite"
  url      = "file:./dev.db"
}

model User {
  id        String    @id @default(uuid())
  deviceId  String    @unique @map("device_id")
  createdAt DateTime  @default(now()) @map("created_at")
  updatedAt DateTime  @updatedAt @map("updated_at")
  history   History[]

  @@map("users")
}

model History {
  id             String   @id @default(uuid())
  userId         String   @map("user_id")
  restaurantId   String   @map("restaurant_id")
  restaurantName String   @map("restaurant_name")
  restaurantData String   @map("restaurant_data")
  action         String
  createdAt      DateTime @default(now()) @map("created_at")
  user           User     @relation(fields: [userId], references: [id])

  @@map("history")
}
```

### 6.2 テーブル定義（SQL）

```sql
-- ユーザーテーブル
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  device_id TEXT UNIQUE NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- 履歴テーブル
CREATE TABLE history (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  restaurant_id TEXT NOT NULL,
  restaurant_name TEXT NOT NULL,
  restaurant_data TEXT NOT NULL, -- JSON
  action TEXT NOT NULL, -- 'selected' | 'skipped'
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- インデックス
CREATE INDEX idx_history_user_id ON history(user_id);
CREATE INDEX idx_history_created_at ON history(created_at);
```

---

## 7. 画面設計

### 7.1 画面一覧

| 画面 | 説明 |
|------|------|
| ホーム画面 | 条件入力・検索開始 |
| 結果画面 | 店舗提案・決定/スキップ |
| 履歴画面 | 過去の選択履歴 |

### 7.2 ホーム画面

```
┌─────────────────────────────┐
│         Kimeshi             │
│                             │
│  ┌───────────────────────┐  │
│  │     現在地取得中...    │  │
│  │     📍 渋谷区神南      │  │
│  └───────────────────────┘  │
│                             │
│  予算                       │
│  ┌─────┬─────┬─────┬─────┐  │
│  │〜1000│〜2000│〜3000│ なし │  │
│  └─────┴─────┴─────┴─────┘  │
│                             │
│  ジャンル                   │
│  ┌─────┬─────┬─────┬─────┐  │
│  │ 和食 │ 洋食 │ 中華 │ ALL │  │
│  └─────┴─────┴─────┴─────┘  │
│                             │
│  距離                       │
│  ○──────────●────────○      │
│  300m      1km       3km    │
│                             │
│  ┌───────────────────────┐  │
│  │     🍽 今日はここ！    │  │
│  └───────────────────────┘  │
│                             │
│         履歴を見る          │
└─────────────────────────────┘
```

### 7.3 結果画面

```
┌─────────────────────────────┐
│  ←                          │
│                             │
│  ┌───────────────────────┐  │
│  │                       │  │
│  │      [店舗画像]       │  │
│  │                       │  │
│  └───────────────────────┘  │
│                             │
│  居酒屋 kimeshi             │
│  ⭐ 3.8  💰 2000〜3000円     │
│  📍 渋谷駅から徒歩5分        │
│                             │
│  ┌───────────────────────┐  │
│  │   🗺 地図で見る        │  │
│  └───────────────────────┘  │
│                             │
│  ┌───────────┬───────────┐  │
│  │  これじゃ  │  ここに   │  │
│  │   ない    │  決めた！ │  │
│  └───────────┴───────────┘  │
│                             │
│  残り 15 件                 │
└─────────────────────────────┘
```

---

## 8. 外部API

### 8.1 ホットペッパーグルメAPI

- **エンドポイント**: `https://webservice.recruit.co.jp/hotpepper/gourmet/v1/`
- **認証**: APIキー（クエリパラメータ）
- **レート制限**: 1日あたりのリクエスト数制限あり
- **ドキュメント**: https://webservice.recruit.co.jp/doc/hotpepper/reference.html

### 8.2 使用するパラメータ

| パラメータ | 説明 |
|-----------|------|
| key | APIキー |
| lat | 緯度 |
| lng | 経度 |
| range | 検索範囲 (1:300m 〜 5:3000m) |
| budget | 予算コード |
| genre | ジャンルコード |
| format | json |

---

## 9. 開発ロードマップ

### Phase 1: MVP開発（v1.0）

1. プロジェクトセットアップ
   - [ ] Flutter プロジェクト作成
   - [ ] バックエンド プロジェクト作成
   - [ ] Docker環境構築
   - [ ] ホットペッパーAPIキー取得
   - [ ] Turso データベース作成

2. バックエンド開発
   - [ ] Hono セットアップ
   - [ ] Docker Compose 動作確認
   - [ ] Zodスキーマ定義
   - [ ] ホットペッパーAPI連携
   - [ ] 店舗提案エンドポイント実装
   - [ ] Cloudflare Workers デプロイ

3. モバイル開発
   - [ ] 基本構成（MVVM + Repository + Service）
   - [ ] 位置情報取得
   - [ ] ホーム画面
   - [ ] 結果画面
   - [ ] API連携
   - [ ] ローカル履歴保存

4. テスト・調整
   - [ ] 単体テスト
   - [ ] 実機テスト
   - [ ] UI調整

### Phase 2: 認証・同期（v1.1）

- [ ] ユーザー認証（匿名/Google）
- [ ] 履歴のサーバー保存
- [ ] お気に入り機能

### Phase 3: 機能拡張（v1.2〜）

- [ ] SNSシェア
- [ ] プッシュ通知
- [ ] レコメンド改善

---

## 10. 環境変数

### 10.1 バックエンド

```env
# .env
HOTPEPPER_API_KEY=your_api_key
TURSO_DATABASE_URL=libsql://your-db.turso.io
TURSO_AUTH_TOKEN=your_auth_token
```

### 10.2 モバイル

```dart
// lib/core/constants/env.dart
class Env {
  static const apiBaseUrl = String.fromEnvironment(
    'API_BASE_URL',
    defaultValue: 'http://localhost:8787',
  );
}
```

---

## 11. Docker構成

### 11.1 概要

| 環境 | ランタイム | 用途 |
|------|-----------|------|
| 開発 | Bun (Docker) | ローカル開発・テスト |
| 本番 | Cloudflare Workers | 本番デプロイ |

### 11.2 Dockerfile

```dockerfile
# docker/Dockerfile
FROM oven/bun:1.1-alpine AS base
WORKDIR /app

# 依存関係インストール
FROM base AS deps
COPY package.json bun.lockb ./
RUN bun install --frozen-lockfile

# 開発用
FROM base AS dev
COPY --from=deps /app/node_modules ./node_modules
COPY . .
EXPOSE 8787
CMD ["bun", "run", "dev"]

# 本番ビルド
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN bun run build

# 本番用
FROM base AS prod
COPY --from=builder /app/dist ./dist
COPY --from=deps /app/node_modules ./node_modules
COPY package.json ./
EXPOSE 8787
CMD ["bun", "run", "start"]
```

### 11.3 docker-compose.yml

```yaml
version: '3.8'

services:
  api:
    build:
      context: .
      dockerfile: docker/Dockerfile
      target: dev
    ports:
      - "8787:8787"
    volumes:
      - .:/app
      - /app/node_modules
    environment:
      - NODE_ENV=development
      - HOTPEPPER_API_KEY=${HOTPEPPER_API_KEY}
      - TURSO_DATABASE_URL=${TURSO_DATABASE_URL}
      - TURSO_AUTH_TOKEN=${TURSO_AUTH_TOKEN}
    env_file:
      - .env
    command: bun run dev

  # ローカルDB（オプション：Tursoの代わりにSQLiteを使用）
  # libsql:
  #   image: ghcr.io/tursodatabase/libsql-server:latest
  #   ports:
  #     - "8080:8080"
  #   volumes:
  #     - libsql_data:/var/lib/sqld

# volumes:
#   libsql_data:
```

### 11.4 開発コマンド

```bash
# 起動
docker compose up

# バックグラウンド起動
docker compose up -d

# ログ確認
docker compose logs -f api

# 停止
docker compose down

# 再ビルド
docker compose build --no-cache

# コンテナ内でコマンド実行
docker compose exec api bun run test
```

### 11.5 package.json スクリプト

```json
{
  "scripts": {
    "dev": "bun run --hot src/index.ts",
    "build": "bun build src/index.ts --outdir ./dist --target bun",
    "start": "bun run dist/index.js",
    "test": "bun test",
    "lint": "eslint src/",
    "typecheck": "tsc --noEmit",
    "deploy": "wrangler deploy"
  }
}
```

### 11.6 .env.example

```env
# ホットペッパーAPI
HOTPEPPER_API_KEY=your_api_key_here

# Turso Database
TURSO_DATABASE_URL=libsql://your-db.turso.io
TURSO_AUTH_TOKEN=your_auth_token_here

# 環境
NODE_ENV=development
```

### 11.7 本番デプロイ

本番環境はCloudflare Workersにデプロイします。

```bash
# Cloudflare にデプロイ
bun run deploy

# または
wrangler deploy
```

---

## 12. 参考リンク

- [Flutter 公式](https://flutter.dev/)
- [Riverpod 公式](https://riverpod.dev/)
- [Hono 公式](https://hono.dev/)
- [Turso 公式](https://turso.tech/)
- [Bun 公式](https://bun.sh/)
- [Docker 公式](https://www.docker.com/)
- [ホットペッパーAPI](https://webservice.recruit.co.jp/doc/hotpepper/)
- [Cloudflare Workers](https://workers.cloudflare.com/)
