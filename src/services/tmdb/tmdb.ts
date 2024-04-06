import { addMissingKeyNotice } from '../add-missing-key-notice/add-missing-key-notice'

export const tmdb = {
  async getOptions() {
    const { tmdbReadAccessToken } = await browser.storage.sync.get(
      'tmdbReadAccessToken'
    )

    if (!tmdbReadAccessToken) {
      addMissingKeyNotice()

      return null
    }

    return {
      method: 'GET',
      headers: {
        accept: 'application/json',
        Authorization: `Bearer ${tmdbReadAccessToken}`
      }
    }
  },

  async request(url: string) {
    const options = await tmdb.getOptions()

    if (!options) {
      return null
    }

    const result = await fetch(url, options)

    return result.json() as Record<string, any>
  },

  async getCache(cacheKey: string) {
    const data = await browser.storage.local.get(cacheKey)

    return data[cacheKey]
  },

  async setCache(cacheKey: string, data: any) {
    return browser.storage.local.set({ [cacheKey]: data })
  },

  async getVideos(type: 'tv' | 'movie', itemId: string) {
    const cacheKey = `${type}-${itemId}-videos`
    const cache = await tmdb.getCache(cacheKey)

    if (cache) {
      return cache
    }

    const url = `https://api.themoviedb.org/3/${type}/${itemId}/videos`
    const data = await tmdb.request(url)

    if (data !== null) {
      tmdb.setCache(cacheKey, data)
    }

    return data
  },

  async getExternalIds(type: 'tv' | 'movie', itemId: string) {
    const cacheKey = `${type}-${itemId}-externalIds`
    const cache = await tmdb.getCache(cacheKey)

    if (cache) {
      return cache
    }

    const url = `https://api.themoviedb.org/3/${type}/${itemId}/external_ids`
    const data = await tmdb.request(url)

    if (data !== null) {
      tmdb.setCache(cacheKey, data)
    }

    return data
  },

  async searchByTitleAndYear(
    type: 'tv' | 'movie',
    title: string,
    year: string
  ) {
    const safeTitle = title.replace(/[^a-zA-Z0-9 ]/g, '').replace(/\s/g, '-')
    const cacheKey = `${type}-${safeTitle}-${year}-itemId`
    const cache = await tmdb.getCache(cacheKey)

    if (cache) {
      return cache
    }

    const encodedTitle = encodeURIComponent(title)
    const url = `https://api.themoviedb.org/3/search/${type}?query=${encodedTitle}&year=${year}`
    const data = await tmdb.request(url)

    if (data !== null) {
      const id = data.results?.[0]?.id

      if (id) {
        await tmdb.setCache(cacheKey, id)
      }

      return id
    }

    return null
  }
}
