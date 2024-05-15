import "./main.css";
import {
  getLangOptionsWithLink,
  getRawTranscript,
  getTranscriptWithTime,
} from "./transcript.js";

import { createIcons, Copy, BookMarked, Rabbit } from "lucide";
import { getSearchParam } from "./searchParam";
import { copyTextToClipboard } from "./copy";

export async function initializeUIComponents() {
  await waitForElm("#secondary.style-scope.ytd-watch-flexy");
  // TODO: HOVER EFFECT ON BTNS
  // TODO: LABELS ON HOVER
  // TODO: TOAST WHEN YOU COPY.
  // TODO CHANGE ICON OF COPY SECTION
  // TODO SHOW COPY SECTION ICON ONLY IF THERE ARE SECTIONS.
  document
    .querySelector("#secondary.style-scope.ytd-watch-flexy")
    .insertAdjacentHTML(
      "afterbegin",
      `
        <div class="yt_summary_container">
            <div id="yt_summary_header" class="yt_summary_header">
                <p class="yt_summary_header_text">Transcript</p>
                <div class="yt_summary_header_actions">
                    <div id="yt_summary_header_copy" class="yt_summary_header_action_btn yt-summary-hover-el" data-hover-label="Copy Transcript">
                        <i data-lucide="copy"></i>
                    </div>  
                    
                    <div id="yt_summary_header_copy_section" class="yt_summary_header_action_btn yt-summary-hover-el" data-hover-label="Copy sections transcript">
                        <i data-lucide="book-marked"></i>
                    </div> 
                    
                     <div id="yt_summary_header_copy_relative_time" class="yt_summary_header_action_btn yt-summary-hover-el" data-hover-label="Copy sections transcript">
                        <i data-lucide="rabbit"></i>
                    </div>        
                </div>
            </div>
        </div>`,
    );

  createIcons({
    icons: {
      Copy,
      BookMarked,
      Rabbit,
    },
  });

  // TODO:HANDLE NO SECTION VIDEO GRACEFULLY
  // evt listener copy section button
  document
    .querySelector("#yt_summary_header_copy_section")
    .addEventListener("click", async (e) => {
      e.stopPropagation();
      const videoId = getSearchParam(window.location.href).v;

      const currentChapterTimestamps = getCurrentChapterTimestamps();

      const customWrapper = await getCustomWrapper("copyChaptContent");
      copyTranscript(videoId, currentChapterTimestamps, customWrapper);
    });

  // event listener to copy relative time segments
  document
    .querySelector("#yt_summary_header_copy_relative_time")
    .addEventListener("click", async (e) => {
      e.stopPropagation();
      const videoId = getSearchParam(window.location.href).v;

      // calculate the time segment around the current video position
      const relativeTimeSegment = getRelativeTimeSegment();

      const customWrapper = await getCustomWrapper("copyNearbyContent");
      // copy the transcript for the calculated time segment
      copyTranscript(videoId, relativeTimeSegment, customWrapper);
    });

  // evt listener copy button
  document
    .querySelector("#yt_summary_header_copy")
    .addEventListener("click", async (e) => {
      e.stopPropagation();
      const videoId = getSearchParam(window.location.href).v;

      const customWrapper = await getCustomWrapper("copyAllContent");
      copyTranscript(videoId, null, customWrapper);
    });

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

// TODO: MAKE TIME OFFSET ADJUSTABLE IN BOTH SIDES MAYBE

function getRelativeTimeSegment() {
  const currentTime = convertHmsToInt(
    document.querySelector("span.ytp-time-current").innerHTML,
  );

  const timeOffset = 7;

  return {
    start: Math.max(0, currentTime - timeOffset), // Ensure start time is not negative
    end: currentTime + timeOffset, // End time is x seconds after current time
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
