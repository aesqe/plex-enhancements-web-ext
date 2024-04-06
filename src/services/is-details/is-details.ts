export const isDetails = () =>
  ['metadata-title', 'metadata-line1', 'metadata-poster'].every(
    testId => !!document.querySelector(`[data-testid="${testId}"]`)
  )
