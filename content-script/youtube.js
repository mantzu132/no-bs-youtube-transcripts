import "./main.css";
import {
	ArrowDown,
	ArrowDownToDot,
	BookMarked,
	Clock,
	Copy,
	createIcons,
} from "lucide";
import { copyTranscript } from "./copy";
import {
	attachTimeEventListeners,
	removeTimeEventListeners,
	removeTranscriptClickListener,
	setupTranscriptClickListener,
} from "./event-listeners.js";
import {
	convertHmsToInt,
	getTotalVideoDuration,
	getVideoId,
	showErrorToast,
	elementExists,
	convertIntToHms,
	getCurrentTime,
	getVideoDuration,
} from "./utils.js";
import { getTranscriptHTML } from "./transcript";

// need to set up shared state for highlighting when clicking on transcript time
export const state = {
	selectedSegment: null,
};

// #middle-row
// #secondary.style-scope.ytd-watch-flexy
export function initializeUiComponents() {
	const insertionTarget = "#secondary.style-scope.ytd-watch-flexy";

	if (elementExists(insertionTarget)) {
		document.querySelector(insertionTarget).insertAdjacentHTML(
			"afterbegin",
			`
			<div class="yt_summary_container">
  <div id="yt_summary_header" class="yt_summary_header">
    <div class="yt_summary_header_actions">
      <button id="yt_summary_header_copy" class="yt_summary_header_action_btn yt-summary-hover-el" data-hover-label="Copy full Transcript">
        <i data-lucide="copy"></i>
      </button>
      <button id="yt_summary_header_copy_section" class="yt_summary_header_action_btn yt-summary-hover-el" data-hover-label="Copy chapter transcript">
        <i data-lucide="book-marked"></i>
      </button>
    </div>
    
    <p class="yt_summary_header_text">Transcript</p>
    
    <div class="yt_summary_header_actions">
      <button id="yt_summary_header_copy_time" class="yt_summary_header_action_btn yt-summary-hover-el" data-hover-label="Copy from specific time" aria-expanded="false">
        <i data-lucide="clock"></i>
      </button>
			<button id="yt_summary_header_jump" class="yt_summary_header_action_btn yt-summary-hover-el" data-hover-label="Scrolls to current segment" hidden>
        <i data-lucide="arrow-down-to-dot"></i>
      </button>
      <button id="yt_summary_header_expand" class="yt_summary_header_action_btn yt-summary-hover-el" data-hover-label="Expand transcript" aria-expanded="false">
        <i data-lucide="arrow-down"></i>
      </button>
    </div>
  </div>
  
  <div id="yt_summary_menu" class="yt_summary_menu" hidden>
      <div class="time-range-inputs">
          <input type="text" name="start_time" autocomplete="off" class="input" placeholder="0:00" id="start-time">
        <div class="separator">
          <span class="separator-text">-</span>
        </div>
          <input type="text" name="end_time" autocomplete="off" class="input" placeholder="0:00" id="end-time">
      </div>
      <button id="copy-time-range">Copy</button>
  </div>
  
  <div id="yt_summary_transcript_container" data-loaded="false" hidden >
    <ul class="yt_summary_transcript">
    </ul>
  </div>
	</div>
			`,
		);

		createIcons({
			icons: {
				Copy,
				BookMarked,
				Clock,
				ArrowDown,
				ArrowDownToDot,
			},
		});

		// event listener copy chapter/section button
		document
			.querySelector("#yt_summary_header_copy_section")
			.addEventListener("click", async (e) => {
				e.stopPropagation();

				try {
					const videoId = getVideoId();

					const currentChapterTimestamps = getCurrentChapterTimestamps();

					const customWrapper = await getCustomWrapper("copyChaptContent");
					await copyTranscript(
						videoId,
						currentChapterTimestamps,
						customWrapper,
					);
				} catch (error) {
					showErrorToast(error);
				}
			});

		// event listener copy button
		document
			.querySelector("#yt_summary_header_copy")
			.addEventListener("click", async (e) => {
				e.stopPropagation();

				try {
					const videoId = getVideoId();
					const customWrapper = await getCustomWrapper("copyAllContent");
					await copyTranscript(videoId, null, customWrapper);
				} catch (error) {
					showErrorToast(error);
				}
			});

		// event listener to open copy specific time functionality
		document
			.getElementById("yt_summary_header_copy_time")
			.addEventListener("click", () => {
				const startTimeInput = document.getElementById("start-time");
				const endTimeInput = document.getElementById("end-time");
				const button = document.querySelector("#yt_summary_header_copy_time");
				const menu = document.getElementById("yt_summary_menu");
				if (menu.hidden) {
					attachTimeEventListeners();
					menu.hidden = false;
					startTimeInput.focus();
					button.ariaExpanded = "true";
				} else {
					removeTimeEventListeners();
					menu.hidden = true;
					startTimeInput.value = "";
					endTimeInput.value = "";
					button.ariaExpanded = "false";
				}
			});

		//event listener: hover label
		Array.from(document.getElementsByClassName("yt-summary-hover-el")).forEach(
			(el) => {
				const label = el.getAttribute("data-hover-label");
				if (!label) {
					return;
				}
				el.addEventListener("mouseenter", (e) => {
					e.stopPropagation();
					e.preventDefault();
					Array.from(
						document.getElementsByClassName("yt_ai_summary_header_hover_label"),
					).forEach((el) => {
						el.remove();
					});
					el.insertAdjacentHTML(
						"beforeend",
						`<div class="yt_ai_summary_header_hover_label">${label.replace(
							/\n+/g,
							`<br />`,
						)}</div>`,
					);
				});
				el.addEventListener("mouseleave", (e) => {
					e.stopPropagation();
					e.preventDefault();
					Array.from(
						document.getElementsByClassName("yt_ai_summary_header_hover_label"),
					).forEach((el) => {
						el.remove();
					});
				});
			},
		);

		// event listener to expand transcript
		document
			.querySelector("#yt_summary_header_expand")
			.addEventListener("click", async (e) => {
				e.stopPropagation();

				const videoId = getVideoId();

				const transcriptHtml = await getTranscriptHTML(
					window.noBsTranscripts.transcriptUrl,
					videoId,
				);

				const ulElement = document.querySelector("ul.yt_summary_transcript");
				const transcContainer = document.querySelector(
					"#yt_summary_transcript_container",
				);
				const expandButton = document.querySelector(
					"#yt_summary_header_expand",
				);
				const jumpButton = document.querySelector("#yt_summary_header_jump");

				if (transcContainer.hidden) {
					transcContainer.hidden = false;
					expandButton.ariaExpanded = "true";
					jumpButton.hidden = false;

					if (transcContainer.dataset.loaded !== "true") {
						ulElement.insertAdjacentHTML("afterbegin", transcriptHtml);
						transcContainer.dataset.loaded = "true";
					}

					setupTranscriptClickListener();
				} else {
					transcContainer.hidden = true;
					expandButton.ariaExpanded = "false";
					jumpButton.hidden = true;

					removeTranscriptClickListener();
				}
			});

		// event listener to jump to the current timestamp

		document
			.querySelector("#yt_summary_header_jump")
			.addEventListener("click", () => {
				if (state.selectedSegment !== null) {
					state.selectedSegment.classList.remove("highlighted-segment");
				}

				const segment = scrollIntoCurrTime();
				state.selectedSegment = segment;

				segment.classList.add("highlighted-segment");
			});

		//event listener copy time range
		document
			.getElementById("copy-time-range")
			.addEventListener("click", async (e) => {
				e.stopPropagation();

				const startTimeInput = document.getElementById("start-time");
				const endTimeInput = document.getElementById("end-time");

				try {
					const videoId = getVideoId();
					const timeRange = getTimeRange();

					const customWrapper = await getCustomWrapper("copyTimeContent");
					await copyTranscript(videoId, timeRange, customWrapper);

					startTimeInput.placeholder = convertIntToHms(timeRange.start);
					endTimeInput.placeholder = convertIntToHms(timeRange.end);
				} catch (error) {
					showErrorToast(error);
				} finally {
					startTimeInput.value = "";
					endTimeInput.value = "";
				}
			});

		checkForChapters();
	}
}

// Function that gets all the chapters of a YouTube video and when each starts.
function parseChapters() {
	const chapterListRenderer = document.querySelector(
		"ytd-macro-markers-list-renderer",
	);

	const chapterItems = chapterListRenderer.querySelectorAll(
		"ytd-macro-markers-list-item-renderer",
	);

	const chapters = [];

	// Map through elements to extract title and time
	chapterItems.forEach((chapter) => {
		const title = chapter.querySelector(".macro-markers").textContent;
		const timeStr = chapter.querySelector("#time").textContent;

		const start = convertHmsToInt(timeStr);

		chapters.push({ title, start });
	});

	return chapters;
}

function getCurrentChapterTimestamps() {
	const videoDuration = getTotalVideoDuration();

	const currentChapter = document.querySelector(
		"div.ytp-chapter-title-content",
	).textContent;

	const chapters = parseChapters();

	const currentChapterData = chapters.find(
		(chapter) => chapter.title === currentChapter,
	);

	const currentChapterIndex = chapters.findIndex(
		(chapter) => chapter.title === currentChapter,
	);
	const nextChapter = chapters[currentChapterIndex + 1];
	const endTimestamp = nextChapter ? nextChapter.start - 0.01 : videoDuration;

	const currentChapterTimestamps = {
		start: currentChapterData.start,
		end: endTimestamp,
	};

	return currentChapterTimestamps;
}

// Extract the time that was inputted in order to copy transcript from x to y time.
function getTimeRange() {
	const getInputValue = (id, defaultValue) => {
		const value = document.getElementById(id).value.trim();
		const currentTime = getCurrentTime();

		if (value.toLowerCase() === "now") {
			return currentTime || defaultValue;
		}
		if (value === "") {
			return defaultValue;
		}
		return value;
	};

	const videoDuration = getVideoDuration();
	const startTime = getInputValue("start-time", "0:00");
	const endTime = getInputValue("end-time", videoDuration);

	return {
		start: convertHmsToInt(startTime),
		end: convertHmsToInt(endTime),
	};
}

function getCustomWrapper(key) {
	return new Promise((resolve, reject) => {
		chrome.storage.local.get(
			{
				[key]: `{{Transcript}}`, // this should be same as options.js chrome.storage.local.get
			},
			(items) => {
				if (chrome.runtime.lastError) {
					reject(chrome.runtime.lastError);
				} else {
					resolve(items[key]);
				}
			},
		);
	});
}

function checkForChapters() {
	// Check for the presence of the chapters button and its disabled state
	const chaptersButton = document.querySelector(
		"#movie_player > div.ytp-chrome-bottom > div.ytp-chrome-controls > div.ytp-left-controls > div:nth-child(6) > button",
	);

	// Conditionally hide the copy section button based on the disabled state of the chapters button
	const copySectionButton = document.querySelector(
		"#yt_summary_header_copy_section",
	);
	if (chaptersButton && !chaptersButton.hasAttribute("disabled")) {
		copySectionButton.style.display = "";
	} else {
		copySectionButton.remove();
	}
}

/**
 * Scrolls into view the current time segment in a transcript list.
 *
 * @returns {HTMLElement|null} The segment that was scrolled into view, or null if no segment was found.
 */
function scrollIntoCurrTime() {
	const currTime = convertHmsToInt(getCurrentTime());

	const transcriptUl = document.querySelector("ul.yt_summary_transcript");
	if (!transcriptUl) return;

	const items = transcriptUl.children;
	let segment = null;

	Array.from(items).forEach((el, i, arr) => {
		const startTimeOfEl = el.getAttribute("data-start-time");
		const startTimeOfNextEl =
			i === arr.length - 1
				? convertHmsToInt(getVideoDuration())
				: arr[i + 1].getAttribute("data-start-time");

		// Handle the case where we're at the beginning of the video and the current time is before the start time of the first segment
		if (i === 0 && currTime < startTimeOfEl) {
			el.scrollIntoView({ behavior: "auto", block: "center" });
			segment = el;
			return;
		}

		if (currTime >= startTimeOfEl && currTime < startTimeOfNextEl) {
			el.scrollIntoView({ behavior: "auto", block: "center" });
			segment = el;
		}
	});

	return segment;
}
