import { initializeUiComponents } from "./youtube";

import {
	cleanUpContainer,
	doubleClickElement,
	elementExists,
	injectScript,
} from "./utils.js";

// SETUP SHARED STATE
if (!window.noBsTranscripts) {
	window.noBsTranscripts = {
		transcriptUrl: null,
		isScriptInjected: false, // Tracks if interceptor.js is injected
		isTranscriptListenerAdded: false, // Tracks if TranscriptUrlFound listener is added
		isKeypressListenerAdded: false, // Tracks if keypress listener is added
	};
}
// SETUP INJECTION AND LISTENER

// Add event listener for TranscriptUrlFound only once
if (!window.noBsTranscripts.isTranscriptListenerAdded) {
	window.addEventListener("TranscriptUrlFound", (event) => {
		// remove fmt=json as we need XML
		const url = new URL(event.detail.url);
		const params = new URLSearchParams(url.search);
		params.delete("fmt");
		url.search = params.toString();
		const newUrlString = url.toString();

		window.noBsTranscripts.transcriptUrl = newUrlString;
	});
	window.noBsTranscripts.isTranscriptListenerAdded = true;
}

// Add keypress event listener only once
if (!window.noBsTranscripts.isKeypressListenerAdded) {
	document.addEventListener("keydown", handleToggle, {
		passive: true,
	});
	window.noBsTranscripts.isKeypressListenerAdded = true;
}

// Inject the script if not already injected
if (!window.noBsTranscripts.isScriptInjected) {
	injectScript("interceptor.js");
	window.noBsTranscripts.isScriptInjected = true;
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
				window.noBsTranscripts.transcriptUrl = null;
				toggleState = false;
			} else {
				initializeUiComponents();

				doubleClickElement(".ytp-subtitles-button"); // double clicking has nothing to do with toggleState
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
