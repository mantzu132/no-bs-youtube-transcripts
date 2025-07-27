import { defineConfig } from "vite";
import { crx } from "@crxjs/vite-plugin";
import manifest from "./manifest.json";

export default defineConfig({
	plugins: [crx({ manifest, browser: "firefox" })],
});

// export default defineConfig({
//   base: "./",
//   plugins: [crx({ manifest })],
//   build: {
//     rollupOptions: {
//       input: {
//         contentScript: 'content-script/index.js',
//         options: 'options.html',
//         serviceWorker: 'service-worker.js'
//       }
//     },
//   },
// });
