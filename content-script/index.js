import {
  initializeUIComponents,
} from "./youtube";

import {cleanUpContainer} from "./utils.js";


let oldHref = "";



const bodyList = document.querySelector("body");
let observer = new MutationObserver((mutations) => {
  mutations.forEach(async (mutation) => {
    if (oldHref !== document.location.href) {
      cleanUpContainer(".yt_summary_container");
      oldHref = document.location.href;

      if (window.location.search.includes("v=")) {

          await initializeUIComponents();
        // performanceTest()

      }
    }
  });
});

observer.observe(bodyList, { childList: true, subtree: true });

