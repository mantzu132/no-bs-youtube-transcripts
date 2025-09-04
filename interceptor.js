// This code runs in the page's context, so it has access to the real XMLHttpRequest (of api/timedtext)
// It's needed so we can get the /api/timedtext url with PO token that youtube hits when transcript button is toggled

const originalXhrOpen = XMLHttpRequest.prototype.open;
XMLHttpRequest.prototype.open = function (...args) {
	const url = args[1];
	if (typeof url === "string" && url.includes("/api/timedtext")) {
		const event = new CustomEvent("TranscriptUrlFound", {
			detail: { url: url },
		});
		window.dispatchEvent(event);
	}
	// Call the original 'open' method so the request can proceed normally
	return originalXhrOpen.apply(this, args);
};
