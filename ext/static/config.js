const saveOptions = async e => {
  e.preventDefault()

  document.querySelector('#tmdbReadAccessToken').classList.add('saved')

  await browser.storage.sync.set({
    tmdbReadAccessToken: document.querySelector('#tmdbReadAccessToken').value
  })
}

const restoreOptions = async () => {
  const tmdb = await browser.storage.sync.get('tmdbReadAccessToken')

  document.querySelector('#tmdbReadAccessToken').value =
    tmdb.tmdbReadAccessToken || ''
}

document.addEventListener('DOMContentLoaded', restoreOptions)
document.querySelector('form').addEventListener('submit', saveOptions)
