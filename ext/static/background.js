const openOptionsPage = () => {
  browser.runtime.openOptionsPage()
}

browser.browserAction.onClicked.addListener(openOptionsPage)

browser.runtime.onMessage.addListener(function (message) {
  switch (message.action) {
    case 'openOptionsPage':
      openOptionsPage()
      break
    default:
      break
  }
})
