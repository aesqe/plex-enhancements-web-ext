import { addTrailer } from './services/add-trailer/add-trailer'
import { $, $testId, crA } from './services/create-element/create-element'
import { insertLinkToCssIfNotExists } from './services/insert-link-to-css-if-not-exists/insert-link-to-css-if-not-exists'
import { isDetails } from './services/is-details/is-details'
import { isSeries } from './services/is-series/is-series'
import { tmdb } from './services/tmdb/tmdb'

const state = {
  dataAddedToPage: false
}

const addDataToPage = async () => {
  const type = isSeries() ? 'tv' : 'movie'

  const ratingsContainer = $testId('metadata-ratings')?.parentElement
  const posterElement = $testId('metadata-poster')
  const titleElement = $testId('metadata-title')
  const yearElement = $testId('metadata-line1')

  const year = yearElement?.textContent?.split(/\s/)[0] ?? ''
  const title = titleElement?.textContent ?? ''

  const itemId = await tmdb.searchByTitleAndYear(type, title, year)

  if (!itemId) {
    return
  }

  if (type === 'movie') {
    ratingsContainer?.appendChild(
      crA(
        'letterboxd-link',
        'View on Letterboxd',
        `https://letterboxd.com/tmdb/${itemId}/`
      )
    )
  }

  ratingsContainer?.appendChild(
    crA(
      'tmdb-link',
      'View on TMDB',
      `https://www.themoviedb.org/${type}/${itemId}/`
    )
  )

  const { imdb_id } = await tmdb.getExternalIds(type, itemId)

  if (imdb_id) {
    ratingsContainer?.appendChild(
      crA('imdb-link', 'View on IMDB', `https://www.imdb.com/title/${imdb_id}`)
    )
  }

  const videos = await tmdb.getVideos(type, itemId)

  const trailer = videos.results.find(video => video.type === 'Trailer')
  const teaser = videos.results.find(video => video.type === 'Teaser')

  if (posterElement) {
    if (trailer) {
      addTrailer('Play trailer', trailer.key, posterElement)
    } else if (teaser) {
      addTrailer('Play teaser', teaser.key, posterElement)
    }
  }

  return
}

const pageMutationsObserver = new MutationObserver(async mutations => {
  if (location.href.includes('/details')) {
    if (isDetails() && !state.dataAddedToPage) {
      addDataToPage()
      state.dataAddedToPage = true
    }
  }
})

pageMutationsObserver.observe(document.body, {
  childList: true,
  subtree: true
})

window.addEventListener('hashchange', () => {
  state.dataAddedToPage = false

  const iframeContainer = $('.plex-enhancements-trailer-iframe-container')
  iframeContainer?.parentElement?.removeChild(iframeContainer)

  const closeButton = $('.plex-enhancements-close-trailer-button')
  closeButton?.parentElement?.removeChild(closeButton)
})

document.addEventListener('keydown', (event: KeyboardEvent) => {
  if (event.key === 'Escape') {
    const iframeContainer = $('.plex-enhancements-trailer-iframe-container')
    iframeContainer?.parentElement?.removeChild(iframeContainer)

    const closeButton = $('.plex-enhancements-close-trailer-button')
    const playButton = $('.plex-enhancements-play-trailer-button')

    if (closeButton) {
      closeButton.style.display = 'none'
    }

    if (playButton) {
      playButton.style.display = 'block'
    }
  }
})

insertLinkToCssIfNotExists()
