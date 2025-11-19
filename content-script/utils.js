import Toastify from "toastify-js";
import "toastify-js/src/toastify.css";

/**
 * Convert time string (e.g 1:49) to seconds
 */
export function convertHmsToInt(hms) {
	//
	// Split the input by colon
	const parts = hms.split(":");

	// Initialize hours, minutes, and seconds
	let hours = 0,
		minutes = 0,
		seconds = 0;

	// Assign values based on the number of parts
	if (parts.length === 3) {
		hours = parseInt(parts[0], 10);
		minutes = parseInt(parts[1], 10);
		seconds = parseInt(parts[2], 10);
	} else if (parts.length === 2) {
		minutes = parseInt(parts[0], 10);
		seconds = parseInt(parts[1], 10);
	} else if (parts.length === 1) {
		seconds = parseInt(parts[0], 10);
	}

	// Calculate total seconds
	return hours * 3600 + minutes * 60 + seconds;
}

/**
 * Convert seconds into time string (e.g 1:49)
 */
export function convertIntToHms(num) {
	const h = num < 3600 ? 14 : 12;
	return new Date(num * 1000).toISOString().substring(h, 19).toString();
}

export function getSearchParam(str) {
	const searchParam = str && str !== "" ? str : window.location.search;

	if (!/\?([a-zA-Z0-9_]+)/i.exec(searchParam)) return {};
	let match,
		pl = /\+/g, // Regex for replacing addition symbol with a space
		search = /([^?&=]+)=?([^&]*)/g,
		decode = function (s) {
			return decodeURIComponent(s.replace(pl, " "));
		},
		index = /\?([a-zA-Z0-9_]+)/i.exec(searchParam)["index"] + 1,
		query = searchParam.substring(index);

	let urlParams = {};
	while ((match = search.exec(query))) {
		urlParams[decode(match[1])] = decode(match[2]);
	}
	return urlParams;
}

export function getVideoId() {
	return getSearchParam(window.location.href).v;
}

export function elementExists(selector) {
	return document.querySelector(selector) !== null;
}

export function getTotalVideoDuration() {
	const durationElement = document.querySelector("span.ytp-time-duration");
	if (durationElement) {
		return convertHmsToInt(durationElement.innerHTML);
	}
	return null;
}

export const showSuccessToast = (message = "Successfully copied") => {
	Toastify({
		text: message,
		duration: 1500,
		close: true,
		gravity: "top", // `top` or `bottom`
		position: "right", // `left`, `center` or `right`
		style: {
			background: "#1a1a1a",
			color: "#ffffff",
			borderLeft: "4px solid rgba(40, 255, 0, 0.4)",
		},
	}).showToast();
};

export const showErrorToast = (message = "An error occurred") => {
	Toastify({
		text: message,
		duration: 1500,
		close: true,
		gravity: "top", // `top` or `bottom`
		position: "right", // `left`, `center` or `right`
		style: {
			background: "#ffffff",
			color: "#1a1a1a",
			borderLeft: "4px solid rgba(255, 0, 0, 0.4)",
			boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
		},
	}).showToast();
};

export function cleanUpContainer(selector) {
	const summaryContainer = document.querySelector(selector);

	if (summaryContainer) {
		summaryContainer.remove();
	}
}

export function injectScript(filePath) {
	const script = document.createElement("script");
	script.setAttribute("type", "text/javascript");
	script.setAttribute("src", chrome.runtime.getURL(filePath));
	(document.head || document.documentElement).appendChild(script);
	script.onload = () => script.remove();
}

export function doubleClickElement(selector) {
	const element = document.querySelector(selector);

	if (element) {
		element.click();
		element.click();

		return true;
	} else {
		console.log(`Element not found for selector: ${selector}`);
		return false;
	}
}

export function getCurrentTime() {
	return (
		document
			.querySelector(".ytp-progress-bar")
			?.getAttribute("aria-valuenow") || ""
	);
}

export const getVideoDuration = () =>
	document.querySelector(".ytp-time-duration")?.textContent;
