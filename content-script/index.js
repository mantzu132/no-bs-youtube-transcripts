import { initializeUIComponents } from "./youtube";

if (window.location.hostname === "www.youtube.com") {
  if (window.location.search !== "" && window.location.search.includes("v=")) {
    const selector =
      "#primary-button > ytd-button-renderer > yt-button-shape > button";

    let button = document.querySelector(selector);

    if (!button) {
      setTimeout(() => {
        button = document.querySelector(selector);

        if (button) {
          initializeUIComponents();
        } else {
        }
      }, 1000);
    } else {
      initializeUIComponents();
    }
  }
}
