import "./main.css";

import {copyTranscript} from "./copy";

import {convertHmsToInt, showErrorToast} from "./utils.js";
import {attachTimeEventListeners} from "./copy-time-event-listeners.js";
import {cleanUpContainer} from "./utils.js";
import {
  createIcons,
  Copy,
  BookMarked,
  Clock,
  Settings,
  Brain,
  ArrowDown,
} from "lucide";
import { getSearchParam} from "./utils.js";
import {waitForElm} from "./utils.js";
import { getTotalVideoDuration} from "./utils.js";

export async function initializeUIComponents() {
  if (!getSearchParam(window.location.href).v) {
    return;
  }


  cleanUpContainer();

  await waitForElm("#secondary.style-scope.ytd-watch-flexy");
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

    <div class="yt_summary_menu_container">
    <div class="time-range-inputs">
        <div class="time-input">
            <input type="text" name="start_time" autocomplete="off" class="input" placeholder="0:00" id="start-time">
        </div>
        <div class="separator">
            <span class="separator-text">-</span>
        </div>
        <div class="time-input">
            <input type="text"  name="end_time" autocomplete="off" class="input" placeholder="0:00" id="end-time">
        </div>
    </div>
    <button id="copy-time-range">Copy</button>
    </div>
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

  // event listener copy chapter/section button
  document
      .querySelector("#yt_summary_header_copy_section")
      .addEventListener("click", async (e) => {
        e.stopPropagation();

        try {
          const videoId = getVideoId();

          const currentChapterTimestamps = getCurrentChapterTimestamps();


          const customWrapper = await getCustomWrapper("copyChaptContent");
          await copyTranscript(videoId, currentChapterTimestamps, customWrapper);
        } catch (error) {
          showErrorToast(error)
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
          showErrorToast(error)
        }

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
        chrome.storage.local.get(["aiSiteUrl"], function (result) {
        });
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
          showErrorToast(error)
        } finally {
          document.getElementById("start-time").value = "";
          document.getElementById("end-time").value = "";
        }

      });

  checkForChapters();
  setTimeout(checkForChapters, 2000); // check after 2 secs
  // cuz disabled attribute appears only later

  attachTimeEventListeners();
}


// Function that gets all the chapters of a YouTube video and when each starts.
function parseChapters() {
  // There are 12 identical #items divs on YouTube
  // The 5th one has the chapter data that we want
  const allItemsDivs = Array.from(document.querySelectorAll("#items"));

  const chapterDataNodes = Array.from(allItemsDivs[4].children);


  // Map through elements to extract title and time
  return chapterDataNodes.map(chapter => {
    const title = chapter.querySelector(".macro-markers").textContent;
    const timeStr = chapter.querySelector("#time").textContent;

    // Convert time string (e.g 1:49) to seconds
    const start = convertHmsToInt(timeStr)

    return {
      title,
      start
    };
  });
}

function getCurrentChapterTimestamps() {
  const videoDuration = getTotalVideoDuration()

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

    if (endTime === "") {
        endTime = "0:00";
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


