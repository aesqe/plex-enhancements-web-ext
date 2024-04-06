import { $, crEl } from '../create-element/create-element'

export const insertLinkToCssIfNotExists = () => {
  if ($('.plex-enhancements-styles')) {
    return
  }

  const link = crEl<HTMLLinkElement>('link', 'styles')
  link.rel = 'stylesheet'
  link.href = browser.runtime.getURL('static/plex-enhancements.css')

  document.head.appendChild(link)
}
