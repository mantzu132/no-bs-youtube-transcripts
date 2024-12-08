import {
  initializeUIComponents,
} from "./youtube";

import {cleanUpContainer} from "./utils.js";


initializeUIComponents()


let isProcessing = false;

chrome.runtime.onMessage.addListener((message) => {
  if (message.type === "URL CHANGE" && !isProcessing) {

    isProcessing = true;

    cleanUpContainer(".yt_summary_container");
    initializeUIComponents();


    // youtube sometimes fires multiple navigation events for one URL change fix
    setTimeout(() => {
      isProcessing = false;
    }, 100);
  }
});



