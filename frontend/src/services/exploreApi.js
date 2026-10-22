// Public discovery endpoints (backend: explore.controller.ts)
import { api } from '@/lib/axios'

const csv = (list) => (Array.isArray(list) && list.length ? list.join(',') : undefined)

/** Drops empty values so the request URL stays clean and cacheable. */
const clean = (params) =>
  Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== '')
  )

/**
 * @param {{ q?: string, genres?: string[], moods?: string[], key?: string,
 *   bpm?: [number, number] | null, price?: [number, number] | null,
 *   sort?: string, page?: number, limit?: number }} filters
 */
export async function fetchExploreTracks(filters = {}, config = {}) {
  const { data } = await api.get('/explore/tracks', {
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

export async function fetchExploreFacets(config = {}) {
  const { data } = await api.get('/explore/facets', config)
  return data
}

export async function fetchExploreProducers({ sort, page, limit } = {}, config = {}) {
  const { data } = await api.get('/explore/producers', {
    ...config,
    params: clean({ sort, page, limit })
  })
  return data
}

export async function fetchExploreSoundkits({ sort, price, page, limit } = {}, config = {}) {
  const { data } = await api.get('/explore/soundkits', {
    ...config,
    params: clean({
      sort,
      priceMin: price?.[0],
      priceMax: price?.[1],
      page,
      limit
    })
  })
  return data
}
