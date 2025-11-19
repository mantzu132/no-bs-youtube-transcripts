// COPY TRANSCRIPT OF SELECTED TIME RANGE FUNCTIONALITY (e.g 1:00 - 2:00 mins)

import { convertIntToHms } from "./utils";
import { state } from "./youtube";

// Shared State and Handlers
let focusedInput = null;

const handleProgressBarClick = (event) => {
	if (event.target.closest(".ytp-progress-bar")) {
		event.preventDefault();

		const tooltip = document.querySelector(
			".ytp-tooltip-progress-bar-pill-time-stamp",
		);

		if (tooltip && focusedInput) {
			focusedInput.value = tooltip.innerText;
		}

		if (focusedInput) {
			focusedInput.blur();
		}
	}
};

const handleTranscriptSegmentClick = (event) => {
	if (!focusedInput) return;

	const listItem = event.target.closest(
		"li.yt_summary_transcript_text_segment",
	);
	const textParagraph = event.target.closest("p.yt_summary_transcript_text");

	// If the click is on the text part of a transcript item
	if (listItem && textParagraph) {
		const startTime = listItem.getAttribute("data-start-time");
		if (startTime) {
			focusedInput.value = convertIntToHms(parseFloat(startTime));
			focusedInput.blur(); // This triggers handleInputBlur for cleanup
		}
	}
};

const handleInputFocus = (event) => {
	focusedInput = event.target;

	// Add listener for progress bar click
	const progressBarContainer = document.querySelector(".ytp-progress-bar");
	if (progressBarContainer) {
		progressBarContainer.addEventListener(
			"pointerdown",
			handleProgressBarClick,
		);
	}

	const transcriptList = document.querySelector(".yt_summary_transcript");
	if (transcriptList) {
		transcriptList.addEventListener(
			"pointerdown",
			handleTranscriptSegmentClick,
		);
	}
};

// Remove listener for progress bar click
const handleInputBlur = () => {
	const progressBarContainer = document.querySelector(".ytp-progress-bar");
	if (progressBarContainer) {
		progressBarContainer.removeEventListener(
			"pointerdown",
			handleProgressBarClick,
		);
	}

	// Remove listener for transcript click
	const transcriptList = document.querySelector(".yt_summary_transcript");
	if (transcriptList) {
		transcriptList.removeEventListener(
			"pointerdown",
			handleTranscriptSegmentClick,
		);
	}

	focusedInput = null;
};

// Main Functions

/**
 * Attaches focus and blur event listeners to summary inputs.
 */
export function attachTimeEventListeners() {
	const ytSummaryMenu = document.querySelector("#yt_summary_menu");
	if (!ytSummaryMenu) return;

	ytSummaryMenu.querySelectorAll(".input").forEach((input) => {
		input.addEventListener("focus", handleInputFocus);
		input.addEventListener("blur", handleInputBlur);
	});
}

/**
 * Removes the focus and blur event listeners from summary inputs.
 */
export function removeTimeEventListeners() {
	const ytSummaryMenu = document.querySelector("#yt_summary_menu");
	if (!ytSummaryMenu) return;

	ytSummaryMenu.querySelectorAll(".input").forEach((input) => {
		input.removeEventListener("focus", handleInputFocus);
		input.removeEventListener("blur", handleInputBlur);
	});

	if (focusedInput) {
		focusedInput.blur();
	}
}
// EXPAND TRANSCRIPT FUNCTONALITY -------------------------------------------------------
let transcriptClickHandler = null;

export function setupTranscriptClickListener() {
	const container = document.getElementById("yt_summary_transcript_container");
	const transcriptList = container.querySelector(".yt_summary_transcript");

	transcriptClickHandler = (event) => {
		const li = event.target.closest("li");

		if (
			!li ||
			(event.target.tagName !== "TIME" && event.target.tagName !== "BUTTON")
		)
			return;

		const startTime = li.getAttribute("data-start-time");
		if (startTime) {
			const videos = document.getElementsByTagName("video");
			if (videos.length > 0) {
				videos[0].currentTime = parseFloat(startTime);
				if (state.selectedSegment !== null) {
					state.selectedSegment.classList.remove("highlighted-segment");
				}
				li.classList.add("highlighted-segment");

				state.selectedSegment = li;
			}
		}
	};

	// Add the event listener
	transcriptList.addEventListener("click", transcriptClickHandler);
}

export function removeTranscriptClickListener() {
	const container = document.getElementById("yt_summary_transcript_container");
	const transcriptList = container.querySelector(".yt_summary_transcript");

	if (transcriptClickHandler) {
		transcriptList.removeEventListener("click", transcriptClickHandler);
		transcriptClickHandler = null;
	}
}

// -------------------------------------------------------------------------- END EXPAND TRANSCRIPT FUNC
