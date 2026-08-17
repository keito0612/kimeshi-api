import type { Restaurant, SuggestQuery } from '../schemas/restaurant'

const HOTPEPPER_API_URL = 'https://webservice.recruit.co.jp/hotpepper/gourmet/v1/'

// 予算コードのマッピング
const BUDGET_CODES: Record<string, string> = {
  '1000': 'B009,B010', // ~1000円
  '2000': 'B011,B001', // ~2000円
  '3000': 'B002,B003', // ~3000円
}

// ジャンルコードのマッピング（英語 -> ホットペッパーAPIコード）
const GENRE_CODES: Record<string, string> = {
  japanese: 'G004',      // 和食
  chinese: 'G007',       // 中華
  italian_french: 'G006',       // イタリアン・フレンチ
  korean: 'G017',        // 韓国料理
  asian_ethnic: 'G009',         // アジア・エスニック料理
  western: 'G005',       // 洋食
  izakaya: 'G001',       // 居酒屋
  yakiniku: 'G008',      // 焼肉・ホルモン
  ramen: 'G013',         // ラーメン
  cafe: 'G014',          // カフェ・スイーツ
  bar: 'G012',           // バー・カクテル
  okonomiyaki: 'G016',   // お好み焼き・もんじゃ
}

// 距離コードのマッピング (meters -> range code)
const getRange = (radius: number): number => {
  if (radius <= 300) return 1
  if (radius <= 500) return 2
  if (radius <= 1000) return 3
  if (radius <= 2000) return 4
  return 5
}

interface HotpepperShop {
  id: string
  name: string
  address: string
  lat: number
  lng: number
  budget: {
    name: string
  }
  genre: {
    name: string
  }
  photo: {
    pc: {
      l: string
    }
  }
  urls: {
    pc: string
  }
}

interface HotpepperResponse {
  results: {
    shop: HotpepperShop[]
    results_available: number
  }
}

export class HotpepperService {
  private apiKey: string

  constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  async search(params: SuggestQuery): Promise<{ restaurants: Restaurant[]; total: number }> {
    const searchParams = new URLSearchParams({
      key: this.apiKey,
      lat: params.lat.toString(),
      lng: params.lng.toString(),
      range: getRange(params.radius).toString(),
      format: 'json',
      count: params.limit.toString(),
    })

    if (params.budget && params.budget !== 'unlimited') {
      const budgetCode = BUDGET_CODES[params.budget]
      if (budgetCode) {
        searchParams.append('budget', budgetCode)
      }
    }

    if (params.genre && params.genre !== 'all') {
      const genreCode = GENRE_CODES[params.genre.toLowerCase()]
      if (genreCode) {
        searchParams.append('genre', genreCode)
      } else {
        // マッピングにない場合はキーワード検索にフォールバック
        searchParams.append('keyword', params.genre)
      }
    }

    const response = await fetch(`${HOTPEPPER_API_URL}?${searchParams.toString()}`)

    if (!response.ok) {
      throw new Error(`Hotpepper API error: ${response.status}`)
    }

    const data = (await response.json()) as HotpepperResponse
    const shops = data.results.shop || []

    const restaurants: Restaurant[] = shops.map((shop) => ({
      id: shop.id,
      name: shop.name,
      address: shop.address,
      lat: shop.lat,
      lng: shop.lng,
      budget: shop.budget?.name || '不明',
      genre: shop.genre?.name || '不明',
      image_url: shop.photo?.pc?.l || null,
      hotpepper_url: shop.urls?.pc || '',
    }))

    return {
      restaurants,
      total: data.results.results_available,
    }
  }

  selectRandom(restaurants: Restaurant[], excludeIds: string[]): Restaurant | null {
    const filtered = restaurants.filter((r) => !excludeIds.includes(r.id))
    if (filtered.length === 0) return null
    const index = Math.floor(Math.random() * filtered.length)
    return filtered[index]
  }
}
