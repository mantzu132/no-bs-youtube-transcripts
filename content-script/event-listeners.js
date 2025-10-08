// COPY TRANSCRIPT OF SELECTED TIME RANGE FUNCTIONALITY (e.g 1:00 - 2:00 mins)

// --- Shared State and Handlers ---
// These are defined in a broader scope so both attach and remove functions can access them.

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

const handleInputFocus = (event) => {
	const progressBarContainer = document.querySelector(".ytp-progress-bar");
	focusedInput = event.target;
	if (progressBarContainer) {
		progressBarContainer.addEventListener(
			"pointerdown",
			handleProgressBarClick,
		);
	}
};

const handleInputBlur = () => {
	const progressBarContainer = document.querySelector(".ytp-progress-bar");
	focusedInput = null;
	if (progressBarContainer) {
		progressBarContainer.removeEventListener(
			"pointerdown",
			handleProgressBarClick,
		);
	}
};

// --- Main Functions ---

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

	handleInputBlur();
}

// EXPAND TRANSCRIPT FUNCTONALITY -------------------------------------------------------
let transcriptClickHandler = null;

export function setupTranscriptClickListener() {
	const container = document.getElementById("yt_summary_transcript_container");
	const transcriptList = container.querySelector(".yt_summary_transcript");

	transcriptClickHandler = function (event) {
		const li = event.target.closest("li");

		if (
			!li ||
			(event.target.tagName != "TIME" && event.target.tagName != "BUTTON")
		)
			return;

		const startTime = li.getAttribute("data-start-time");
		if (startTime) {
			const videos = document.getElementsByTagName("video");
			if (videos.length > 0) {
				videos[0].currentTime = parseFloat(startTime);
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
