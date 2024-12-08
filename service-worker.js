chrome.action.onClicked.addListener(() => {
  chrome.runtime.openOptionsPage();
});

// For initializing our UI, cleaning up main container
chrome.webNavigation.onHistoryStateUpdated.addListener(
    (details) => {
      if (details.url.includes('youtube.com') && details.url.includes('v=')) {
        chrome.tabs.sendMessage(details.tabId, {
          type: "URL CHANGE"
        });
      }
    }
);
