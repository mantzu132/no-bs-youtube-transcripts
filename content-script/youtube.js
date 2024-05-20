import "./main.css";
import {
  getLangOptionsWithLink,
  getRawTranscript,
  getTranscriptWithTime,
} from "./transcript.js";

import {
  createIcons,
  Copy,
  BookMarked,
  Clock,
  Settings,
  Brain,
  ArrowDown,
} from "lucide";
import { getSearchParam } from "./searchParam";
import { copyTextToClipboard } from "./copy";

export async function initializeUIComponents() {
  await waitForElm("#secondary.style-scope.ytd-watch-flexy");
  // TODO: ADD 5 BUTTONS CURRENT TIME, VIDEO START/ END TIME, CHAPTER START / END TIME when you click on them while you're focusing on input field THEY WILL POPULATE THE TIME.
  // TODO: IF THERES NO TRANSCRIPT BUTTON HIDE EVERYTHING, MAYBE MAKE AN OPTION TO CHOOSE IF NO TRANSCRIPT WHETHER THE BOX SHOULD BE SHOWED AT ALL.
  document
    .querySelector("#secondary.style-scope.ytd-watch-flexy")
    .insertAdjacentHTML(
      "afterbegin",
      `
     <div class="yt_summary_container">
    <div id="yt_summary_header" class="yt_summary_header">
        <div class="yt_summary_header_actions">
            <button id="yt_summary_header_options" class="yt_summary_header_action_btn yt-summary-hover-el" data-hover-label="Options">
                <i data-lucide="settings"></i>
            </button>
            <button id="yt_summary_header_site" class="yt_summary_header_action_btn yt-summary-hover-el" data-hover-label="Open AI site">
                <i data-lucide="brain"></i>
            </button>
        </div>
        <p class="yt_summary_header_text">Transcript</p>
        <div class="yt_summary_header_actions">
            <button id="yt_summary_header_copy" class="yt_summary_header_action_btn yt-summary-hover-el" data-hover-label="Copy full Transcript">
                <i data-lucide="copy"></i>
            </button>
            <button id="yt_summary_header_copy_section" class="yt_summary_header_action_btn yt-summary-hover-el" data-hover-label="Copy chapter transcript">
                <i data-lucide="book-marked"></i>
            </button>
            <button id="yt_summary_header_copy_time" class="yt_summary_header_action_btn yt-summary-hover-el" data-hover-label="Copy from specific time">
                <i data-lucide="clock"></i>
            </button>
            <button id="yt_summary_header_expand" class="yt_summary_header_action_btn yt-summary-hover-el" data-hover-label="Expand transcript">
                <i data-lucide="arrow-down"></i>
            </button>
        </div>
    </div>
   
    <div id="yt_summary_menu" class="yt_summary_menu" style="display: none;">
    <div class="time-range-inputs">
        <div class="time-input">
            <input type="text" name="start_time" autocomplete="off" class="input" placeholder="00:00" id="start-time">
        </div>
        <div class="separator">
            <span class="separator-text">-</span>
        </div>
        <div class="time-input">
            <input type="text"  name="end_time" autocomplete="off" class="input" placeholder="00:00" id="end-time">
        </div>
    </div>
    <button id="copy-time-range">Copy</button>
</div>
</div>`,
    );

  createIcons({
    icons: {
      Copy,
      BookMarked,
      Clock,
      Settings,
      Brain,
      ArrowDown,
    },
  });

  // event listener to open options
  document
    .querySelector("#yt_summary_header_options")
    .addEventListener("click", (e) => {
      e.stopPropagation();
      if (chrome.runtime.openOptionsPage) {
        chrome.runtime.openOptionsPage();
      } else {
        window.open(chrome.runtime.getURL("options.html"));
      }
    });

  // event listener copy section button
  document
    .querySelector("#yt_summary_header_copy_section")
    .addEventListener("click", async (e) => {
      e.stopPropagation();
      const videoId = getSearchParam(window.location.href).v;

      const currentChapterTimestamps = getCurrentChapterTimestamps();

      const customWrapper = await getCustomWrapper("copyChaptContent");
      copyTranscript(videoId, currentChapterTimestamps, customWrapper);
    });

  // event listener copy button
  document
    .querySelector("#yt_summary_header_copy")
    .addEventListener("click", async (e) => {
      e.stopPropagation();
      const videoId = getSearchParam(window.location.href).v;

      const customWrapper = await getCustomWrapper("copyAllContent");
      copyTranscript(videoId, null, customWrapper);
    });

  // event listener to open the 'menu'
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
    .addEventListener("click", (e) => {
      e.stopPropagation();
      const expandButton = document.querySelector(
        "#primary-button > ytd-button-renderer > yt-button-shape > button",
      );

      expandButton.click();
    });

  // event listener to the "Open AI site" button
  document
    .getElementById("yt_summary_header_site")
    .addEventListener("click", function () {
      chrome.storage.local.get(
        {
          aiSiteUrl: "https://www.phind.com/agent?home=true",
        },
        (result) => {
          const aiSiteUrl = result.aiSiteUrl;
          window.open(aiSiteUrl, "_blank");
        },
      );
      chrome.storage.local.get(["aiSiteUrl"], function (result) {});
    });

  //event listener copy time range
  document
    .getElementById("copy-time-range")
    .addEventListener("click", async (e) => {
      e.stopPropagation();

      const videoId = getSearchParam(window.location.href).v;

      const timeRange = getTimeRange();

      const customWrapper = await getCustomWrapper("copyTimeContent");
      copyTranscript(videoId, timeRange, customWrapper);
    });

  checkForChapters();
  setTimeout(checkForChapters, 2000); // check after 2 secs
  // cuz disabled attribute appears only later
  //-----------------------------------------------------------------
}

initializeUIComponents();
// TODO: ADD CUSTOM FIELD FOR WRAPPER TEXT AROUND COPIED TRANSCRIPT
// SHOULD BE DIFFERENT FOR COPYING THE WHOLE TRANSCRIPT/ A SECTION ETC
async function copyTranscript(videoId, customTimestamps, customWrapper) {
  let contentBody = "";
  const videoTitle = document.title;

  const langOptions = await getLangOptionsWithLink(videoId);
  const rawTranscript = await getRawTranscript(langOptions[0].link);

  let transcriptWithTime;
  // Filters raw transcript to include segments within custom start and end times, if provided
  if (customTimestamps) {
    const currentChapterTranscript = rawTranscript.filter(
      (item) =>
        item.start >= customTimestamps.start &&
        item.start < customTimestamps.end,
    );

    console.log(currentChapterTranscript, "currentChapterTranscript");

    transcriptWithTime = await getTranscriptWithTime(currentChapterTranscript);
  } else {
    // Else copy the whole transcript
    transcriptWithTime = await getTranscriptWithTime(rawTranscript);
  }
  // Replace placeholders in the custom wrapper text
  contentBody = customWrapper
    .replace("{{Title}}", videoTitle)
    .replace("{{Transcript}}", transcriptWithTime);

  console.log(contentBody);

  copyTextToClipboard(contentBody);
}

function waitForElm(selector) {
  return new Promise((resolve) => {
    if (document.querySelector(selector)) {
      return resolve(document.querySelector(selector));
    }

    const observer = new MutationObserver((mutations) => {
      if (document.querySelector(selector)) {
        resolve(document.querySelector(selector));
        observer.disconnect();
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  });
}

function convertHmsToInt(hms) {
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

function parseChapters() {
  const allElements = Array.from(
    document.querySelectorAll(
      "#panels ytd-engagement-panel-section-list-renderer:nth-child(2) #content ytd-macro-markers-list-renderer #contents ytd-macro-markers-list-item-renderer #endpoint #details",
    ),
  );

  const withTitleAndTime = allElements.map((node) => ({
    title: node.querySelector(".macro-markers")?.textContent,
    start: convertHmsToInt(node.querySelector("#time")?.textContent),
  }));

  const filtered = withTitleAndTime.filter(
    (element) =>
      element.title !== undefined &&
      element.title !== null &&
      element.start !== undefined &&
      element.start !== null,
  );

  const withoutDuplicates = [
    ...new Map(filtered.map((node) => [node.start, node])).values(),
  ];

  return withoutDuplicates;
}

function getCurrentChapterTimestamps() {
  const videoDuration = convertHmsToInt(
    document.querySelector("span.ytp-time-duration").innerHTML,
  );

  console.log(videoDuration, "videoduration");
  //////////////
  const currentChapter = document.querySelector(
    "div.ytp-chapter-title-content",
  ).textContent;

  console.log(currentChapter);

  const chapters = parseChapters();

  console.log(chapters);

  const currentChapterData = chapters.find(
    (chapter) => chapter.title === currentChapter,
  );

  console.log(currentChapterData, "currentChapterData");

  const currentChapterIndex = chapters.findIndex(
    (chapter) => chapter.title === currentChapter,
  );
  const nextChapter = chapters[currentChapterIndex + 1];
  const endTimestamp = nextChapter ? nextChapter.start - 0.01 : videoDuration;

  const currentChapterTimestamps = {
    start: currentChapterData.start,
    end: endTimestamp,
  };

  console.log(currentChapterTimestamps);

  return currentChapterTimestamps;
}

function getTimeRange() {
  const startTime = document.getElementById("start-time").value;
  const endTime = document.getElementById("end-time").value;

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
