https://github-production-user-asset-6210df.s3.amazonaws.com/25063550/521415081-9cbf4ffd-119b-4cdc-9694-3a1d5dcfffdf.mp4?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIAVCODYLSA53PQK4ZA%2F20251202%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20251202T152757Z&X-Amz-Expires=300&X-Amz-Signature=397b623b8edd8390ddcef1d397bcf2e312cdded7d78b44bf5f73f4735b1cf927&X-Amz-SignedHeaders=host

## What is this

A Firefox extension for copying YouTube transcripts. Made it because existing tools either lacked features I needed or were overly complicated.

## Features

* Copy the full transcript with one button click

* Copy the transcript for the chapter you're currently watching

* Copy transcripts from a specific time range
  * No need to type timestamps manually. Click on the input field, then click anywhere on the YouTube seek bar to capture that timestamp. Same thing works when clicking transcript text segments. Your video keeps playing normally while you do this.
  * Type "now" in either input and it gets replaced with the current video timestamp
  * Leave the start or end input empty and it defaults to the video's start or end time
  * After copying, the inputs clear but the last copied timestamps stay visible as placeholder text
  
* View the full transcript while watching
  * A button appears in the sidebar when transcripts are open. Click it to scroll to and highlight the current segment
  * Click any timestamp in the transcript to jump the video to that point and highlight that segment
  * Text is larger and centered on wider screens

* "Lightweight". Built with vanilla JS, minimal external libraries, not doing anything fancy.

* Change future transcript copies by switching the video's subtitle language.

* Settings options
  * Set custom text wrappers for each copy type (full transcript, chapter, or time range)
  * Choose where the extension appears (center or sidebar of the YouTube page)
  * Set your own keyboard shortcut. By default, nothing gets inserted when you load a video. Press the shortcut (default is CTRL + ') to show the extension interface

## Build instructions
1. Clone it / CD into the cloned root directory.
2. Run `npm i` in the terminal
3. Run `npm run build` in the terminal. This will generate a dist folder.
4. Load it into firefox.
