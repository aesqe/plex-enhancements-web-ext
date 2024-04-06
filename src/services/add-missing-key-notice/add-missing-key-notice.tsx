import { $, crEl } from '../create-element/create-element'

export const addMissingKeyNotice = () => {
  if ($('.plex-enhancements-missing-key-notice')) {
    return
  }

  const notice = crEl('div', 'missing-key-notice')
  const buttonContainer = crEl('div')

  const text = crEl(
    'p',
    null,
    'Missing TMDB API key. Please add it in the extension options.'
  )

  const dismissButton = crEl(
    'button',
    'missing-key-notice-dismiss-button',
    'Dismiss',
    () => notice.parentElement?.removeChild(notice)
  )

  const optionsButton = crEl(
    'button',
    'missing-key-notice-options-button',
    'Show Options',
    () => browser.runtime.sendMessage({ action: 'openOptionsPage' })
  )

  buttonContainer.appendChild(dismissButton)
  buttonContainer.appendChild(optionsButton)
  notice.appendChild(text)
  notice.appendChild(buttonContainer)
  document.body.appendChild(notice)
}
