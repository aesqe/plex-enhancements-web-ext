const classNamePrefix = 'plex-enhancements-'

export const crEl = <T extends HTMLElement = HTMLElement>(
  tagName: string,
  className?: string | null,
  text?: string | null,
  onClick?: () => void
) => {
  const element = document.createElement(tagName)

  if (className) {
    element.className = `${classNamePrefix}${className}`
  }

  if (text) {
    element.textContent = text

    if (tagName === 'a') {
      element.title = text
    }
  }

  if (onClick) {
    element.addEventListener('click', onClick)
  }

  return element as T
}

export const crA = (className: string, text: string, href: string) => {
  const link = crEl<HTMLAnchorElement>('a', className, text)

  link.href = href
  link.target = '_blank'

  return link
}

export const $ = <T extends HTMLElement = HTMLElement>(selector: string) =>
  document.querySelector(selector) as T

export const $testId = (testId: string) => $(`[data-testid="${testId}"]`)
