console.log("hello world!");
chrome.action.onClicked.addListener(() => {
	chrome.runtime.openOptionsPage();
});

// For initializing our UI, cleaning up main container
// TODO: CHECK Filtered events
chrome.webNavigation.onHistoryStateUpdated.addListener(
	(details) => {
		chrome.tabs.sendMessage(details.tabId, {
			type: "URL_CHANGE",
			newUrl: details.url,
		});
	},
	{ url: [{ hostSuffix: "youtube.com" }] },
);
