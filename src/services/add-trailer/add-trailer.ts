import { crEl } from '../create-element/create-element'

const rootUrl = 'https://www.themoviedb.org/video/play?key='

export const addTrailer = (
  buttonTitle = '',
  trailerKey: string,
  posterContainer: Element
) => {
  const { innerWidth: width, innerHeight } = window
  const height = innerHeight - 250
  const container = crEl('div', 'trailer-iframe-container')

  const playButton = crEl('button', 'play-trailer-button', buttonTitle, () => {
    const iframe = crEl<HTMLIFrameElement>('iframe', 'trailer-iframe')
    iframe.src = `${rootUrl}${trailerKey}&width=${width}&height=${height}`

    container.appendChild(iframe)
    document.body.appendChild(container)

    playButton.style.display = 'none'
    iframe.style.display = 'block'
    closeButton.style.display = 'block'
  })

  const closeButton = crEl('button', 'close-trailer-button', 'Close', () => {
    container?.parentElement?.removeChild(container)
    closeButton.style.display = 'none'
    playButton.style.display = 'block'
  })

  posterContainer?.appendChild(playButton)
  document.body.appendChild(closeButton)
}
