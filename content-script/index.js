import {
  cleanUpContainer,
  getVideoId,
  initializeUIComponents,
} from "./youtube";
import { getLangOptionsWithLink } from "./transcript";

let oldHref = "";

const bodyList = document.querySelector("body");
let observer = new MutationObserver((mutations) => {
  mutations.forEach(async (mutation) => {
    if (oldHref !== document.location.href) {
      cleanUpContainer();
      oldHref = document.location.href;
      console.log("OBSERVER RUNS");

      if (window.location.search.includes("v=")) {
        const videoId = getVideoId();

        const languageOptions = await getLangOptionsWithLink(videoId);

        if (languageOptions) {
          initializeUIComponents();
        }
      }
    }
  });
});

observer.observe(bodyList, { childList: true, subtree: true });

