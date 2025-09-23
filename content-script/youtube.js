import "./main.css";

import { ArrowDown, BookMarked, Clock, Copy, createIcons } from "lucide";
import { copyTranscript } from "./copy";
import { attachTimeEventListeners } from "./copy-time-event-listeners.js";
import {
	convertHmsToInt,
	getTotalVideoDuration,
	getVideoId,
	showErrorToast,
	elementExists,
} from "./utils.js";
import { getTranscriptHTML } from "./transcript";

export function initializeUiComponents() {
	const insertionTarget = "#middle-row";

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
      <button id="yt_summary_header_copy_time" class="yt_summary_header_action_btn yt-summary-hover-el" data-hover-label="Copy from specific time">
        <i data-lucide="clock"></i>
      </button>
      <button id="yt_summary_header_expand" class="yt_summary_header_action_btn yt-summary-hover-el" data-hover-label="Expand transcript">
        <i data-lucide="arrow-down"></i>
      </button>
    </div>
  </div>
  
  <div id="yt_summary_menu" class="yt_summary_menu" style="display: none;">
    <div class="yt_summary_menu_container">
      <div class="time-range-inputs">
        <div class="time-input">
          <input type="text" name="start_time" autocomplete="off" class="input" placeholder="0:00" id="start-time">
        </div>
        <div class="separator">
          <span class="separator-text">-</span>
        </div>
        <div class="time-input">
          <input type="text" name="end_time" autocomplete="off" class="input" placeholder="0:00" id="end-time">
        </div>
      </div>
      <button id="copy-time-range">Copy</button>
    </div>
  </div>
  
  <div id="yt_summary_transcript_container" >
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
			.addEventListener("click", function () {
				const startTimeInput = document.getElementById("start-time");
				const endTimeInput = document.getElementById("end-time");
				const menu = document.getElementById("yt_summary_menu");
				if (menu.style.display === "none" || menu.style.display === "") {
					menu.style.display = "flex";
					startTimeInput.focus();
				} else {
					menu.style.display = "none";
					startTimeInput.value = "";
					endTimeInput.value = "";
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

				ulElement.insertAdjacentHTML("afterbegin", transcriptHtml);

				// TODO: Fix display none

				// TODO: DELETE
				// const expandButton = document.querySelector(
				// 	"#primary-button > ytd-button-renderer > yt-button-shape > button",
				// );
				//
				// expandButton.click();
			});

		//event listener copy time range
		document
			.getElementById("copy-time-range")
			.addEventListener("click", async (e) => {
				e.stopPropagation();

				try {
					const videoId = getVideoId();
					const timeRange = getTimeRange();

					const customWrapper = await getCustomWrapper("copyTimeContent");
					await copyTranscript(videoId, timeRange, customWrapper);
				} catch (error) {
					showErrorToast(error);
				} finally {
					document.getElementById("start-time").value = "";
					document.getElementById("end-time").value = "";
				}
			});

		setTimeout(checkForChapters, 2000); // check after 2 secs
		// cuz disabled attribute appears only later

		attachTimeEventListeners();
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
	let startTime = document.getElementById("start-time").value.trim();
	let endTime = document.getElementById("end-time").value.trim();

	// Default to "0:00" if input is empty
	if (startTime === "") {
		startTime = "0:00";
	}

	let videoDuration =
		document.getElementsByClassName("ytp-time-duration")[0].innerText;

	if (endTime === "") {
		endTime = videoDuration;
	}

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
		copySectionButton.style.display = "none";
	}
}
