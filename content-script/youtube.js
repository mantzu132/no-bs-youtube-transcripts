import "./main.css";
import { getLangOptionsWithLink, getTranscriptWithTime } from "./transcript.js";

import { createIcons, Copy, PenSquare } from "lucide";
import { getSearchParam } from "./searchParam";
import { copyTextToClipboard } from "./copy";

export async function insertSummaryBtn() {
  await waitForElm("#secondary.style-scope.ytd-watch-flexy");
  // TODO: HOVER EFFECT ON BTNS
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
                </div>
            </div>
        </div>`,
    );

  createIcons({
    icons: {
      Copy,
      PenSquare,
    },
  });

  document
    .querySelector("#yt_summary_header_copy")
    .addEventListener("click", (e) => {
      e.stopPropagation();
      const videoId = getSearchParam(window.location.href).v;
      copyTranscript(videoId);
    });

  //-----------------------------------------------------------------
  async function copyTranscript(videoId) {
    let contentBody = "";
    const url = `https://www.youtube.com/watch?v=${videoId}`;
    contentBody += `${document.title}\n`;

    const langOptions = await getLangOptionsWithLink(videoId);

    const transcriptWithTime = await getTranscriptWithTime(langOptions[0]);

    contentBody += transcriptWithTime;

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
}

insertSummaryBtn();
