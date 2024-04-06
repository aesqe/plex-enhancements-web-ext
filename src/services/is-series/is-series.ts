export const isSeries = () =>
  [
    '[data-testid="metadata-title"]',
    '[data-testid="metadata-line1"]',
    '[data-testid="metadata-poster"]',
    '[data-testid="hubTitle"][title="Seasons"]'
  ].every(testId => !!document.querySelector(testId))
