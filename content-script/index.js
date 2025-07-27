import { initializeUiComponents } from "./youtube";

import { cleanUpContainer, elementExists } from "./utils.js";

console.log("hello world from index.js content script!");

// Add the main event listener
if (!window.noBsTranscripts) {
	window.noBsTranscripts = {};
}

if (!window.noBsTranscripts.Listener) {
	window.noBsTranscripts.Listener = true;

	document.addEventListener("keydown", handleToggle, {
		passive: true,
	});
}

// -----

let currentUrl = window.location.href;
let currentUrlIsVideo = currentUrl.includes("watch?v=");
let toggleState = false;

function handleToggle(e) {
	// TODO: change keys to be configurable
	if (e.ctrlKey && e.key === "'") {
		if (currentUrlIsVideo) {
			const summaryContainerSelector = ".yt_summary_container";

			if (elementExists(summaryContainerSelector)) {
				cleanUpContainer(summaryContainerSelector);
				toggleState = false;
			} else {
				initializeUiComponents();
				toggleState = true;
			}
		}
	}
}

// -----

chrome.runtime.onMessage.addListener((message) => {
	if (currentUrl !== message.newUrl) {
		// NOTE: currentUrl is updated after our check, it works out better for our logic here. So it's actually "previous url".

		if (currentUrlIsVideo && toggleState) {
			cleanUpContainer(".yt_summary_container");
			toggleState = false;
		}
		currentUrl = message.newUrl;
		currentUrlIsVideo = currentUrl.includes("watch?v=");
	}
});
