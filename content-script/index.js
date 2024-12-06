import {
  initializeUIComponents,
} from "./youtube";

import {cleanUpContainer} from "./utils.js";


let oldHref = "";

// You can run this test to help decide
async function performanceTest() {
  const tests = [];

  for(let i = 0; i < 10; i++) {
    const start = performance.now();
    await initializeUIComponents();
    const duration = performance.now() - start;
    tests.push(duration);

    // Cleanup for next test
    cleanUpContainer('.yt_summary_container');
    await new Promise(r => setTimeout(r, 100));
  }

  console.log('Average Init Time:',
      tests.reduce((a,b) => a + b, 0) / tests.length, 'ms');
  console.log('Max Init Time:', Math.max(...tests), 'ms');
  console.log('Min Init Time:', Math.min(...tests), 'ms');

  console.log(tests, 'all tests')
}

// performanceTest()

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

