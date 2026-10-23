// Public discovery endpoints (backend: explore.controller.ts)
import { api } from '@/lib/axios'
import type { AxiosRequestConfig } from 'axios'
import type { TrackLike } from '@/types/audio'

export type TrackSortOption = 'newest' | 'popular' | 'liked' | 'price_asc' | 'price_desc' | string
export type ProducerSortOption = 'popular' | 'newest' | 'tracks' | string
export type SoundkitSortOption = 'newest' | 'popular' | 'price_asc' | 'price_desc' | string

export interface ExploreTrackFilters {
  q?: string
  genres?: string[]
  moods?: string[]
  key?: string
  bpm?: [number, number] | null
  price?: [number, number] | null
  sort?: TrackSortOption
  page?: number
  limit?: number
}

export interface ExploreProducerParams {
  q?: string
  sort?: ProducerSortOption
  page?: number
  limit?: number
}

export interface ExploreSoundkitParams {
  q?: string
  sort?: SoundkitSortOption
  price?: [number, number] | null
  page?: number
  limit?: number
}

export interface PagedResponse<T> {
  items: T[]
  total: number
  page: number
  limit: number
  hasMore: boolean
}

export interface ExploreFacets {
  genres: Array<{ _id: string; count: number }>
  moods: Array<{ _id: string; count: number }>
  keys: Array<{ _id: string; count: number }>
  bpmRange: { min: number; max: number }
  priceRange: { min: number; max: number }
}

export interface ProducerItem {
  _id: string
  name: string
  slug: string
  avatar?: string
  trackCount: number
  playsTotal?: number
  likesTotal?: number
}

export interface SoundkitItem {
  _id: string
  name: string
  slug?: string
  art?: string
  price?: number
  user?: {
    _id: string
    name: string
    slug: string
  }
}

const csv = (list?: string[] | null): string | undefined =>
  Array.isArray(list) && list.length ? list.join(',') : undefined

/** Drops empty values so the request URL stays clean and cacheable. */
const clean = <T extends Record<string, unknown>>(params: T): Record<string, unknown> =>
  Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== '')
  )

export async function fetchExploreTracks(
  filters: ExploreTrackFilters = {},
  config: AxiosRequestConfig = {}
): Promise<PagedResponse<TrackLike>> {
  const { data } = await api.get<PagedResponse<TrackLike>>('/explore/tracks', {
    ...config,
    params: clean({
      q: filters.q,
      genre: csv(filters.genres),
      mood: csv(filters.moods),
      key: filters.key,
      bpmMin: filters.bpm?.[0],
      bpmMax: filters.bpm?.[1],
      priceMin: filters.price?.[0],
      priceMax: filters.price?.[1],
      sort: filters.sort,
      page: filters.page,
      limit: filters.limit
    })
  })
  return data
}

export async function fetchExploreFacets(
  config: AxiosRequestConfig = {}
): Promise<ExploreFacets> {
  const { data } = await api.get<ExploreFacets>('/explore/facets', config)
  return data
}

export async function fetchExploreProducers(
  { q, sort, page, limit }: ExploreProducerParams = {},
  config: AxiosRequestConfig = {}
): Promise<PagedResponse<ProducerItem>> {
  const { data } = await api.get<PagedResponse<ProducerItem>>('/explore/producers', {
    ...config,
    params: clean({ q, sort, page, limit })
  })
  return data
}

export async function fetchExploreSoundkits(
  { q, sort, price, page, limit }: ExploreSoundkitParams = {},
  config: AxiosRequestConfig = {}
): Promise<PagedResponse<SoundkitItem>> {
  const { data } = await api.get<PagedResponse<SoundkitItem>>('/explore/soundkits', {
    ...config,
    params: clean({
      q,
      sort,
      priceMin: price?.[0],
      priceMax: price?.[1],
      page,
      limit
    })
  })
  return data
}
