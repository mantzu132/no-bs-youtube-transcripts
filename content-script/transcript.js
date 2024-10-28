import { decode } from "html-entities";
import {convertIntToHms} from "./utils.js";


// From:  an array of objects { "start": "0.43", "duration": "2.64", "text": "transcript text" }
// to:  (02:50) long transcript text combined out of multiple objects "text" fields values that we then copy to clipboard
export async function getTranscriptWithTime(rawTranscript) {
  const scriptObjArr = [],
    timeUpperLimit = 60,
    charInitLimit = 300,
    charUpperLimit = 500;
  let loop = 0,
    chars = [],
    charCount = 0,
    timeSum = 0,
    tempObj = {},
    remaining = {};

  // Sum-up to either total 60 seconds or 300 chars.
  Array.from(rawTranscript).forEach((obj, i, arr) => {
    // Check Remaining Text from Prev Loop
    if (remaining.start && remaining.text) {
      tempObj.start = remaining.start;
      chars.push(remaining.text);
      remaining = {}; // Once used, reset to {}
    }

    // Initial Loop: Set Start Time
    if (loop == 0) {
      tempObj.start = remaining.start ? remaining.start : obj.start;
    }

    loop++;

    const startSeconds = Math.round(tempObj.start); //start time of segment
    const seconds = Math.round(obj.start); // start time of the current piece of transcript data being processed in the loop
    timeSum = seconds - startSeconds;
    charCount += obj.text.length;
    chars.push(obj.text);

    if (i == arr.length - 1) {
      tempObj.text = chars.join(" ").replace(/\n/g, " ");
      scriptObjArr.push(tempObj);
      resetNums();
      return;
    }

    if (timeSum > timeUpperLimit) {
      tempObj.text = chars.join(" ").replace(/\n/g, " ");
      scriptObjArr.push(tempObj);
      resetNums();
      return;
    }

    if (charCount > charInitLimit) {
      if (charCount < charUpperLimit) {
        if (obj.text.includes(".")) {
          const splitStr = obj.text.split(".");

          // Case: the last letter is . => Process regulary
          if (splitStr[splitStr.length - 1].replace(/\s+/g, "") == "") {
            tempObj.text = chars.join(" ").replace(/\n/g, " ");
            scriptObjArr.push(tempObj);
            resetNums();
            return;
          }

          // Case: . is in the middle
          // 1. Get the (length - 2) str, then get indexOf + str.length + 1, then substring(0,x)
          // 2. Create remaining { text: str.substring(x), start: obj.start } => use the next loop
          const lastText = splitStr[splitStr.length - 2];
          const substrIndex = obj.text.indexOf(lastText) + lastText.length + 1;
          const textToUse = obj.text.substring(0, substrIndex);
          remaining.text = obj.text.substring(substrIndex);
          remaining.start = obj.start;

          // Replcae arr element
          chars.splice(chars.length - 1, 1, textToUse);
          tempObj.text = chars.join(" ").replace(/\n/g, " ");
          scriptObjArr.push(tempObj);
          resetNums();
          return;
        } else {
          // Move onto next loop to find .
          return;
        }
      }

      tempObj.text = chars.join(" ").replace(/\n/g, " ");
      scriptObjArr.push(tempObj);
      resetNums();
      return;
    }
  });

  const formattedTranscripts = scriptObjArr.map((obj) => {
    const decodedText = decode(obj.text)
    return `(${convertIntToHms(obj.start)}) ${decodedText}`;
  });

  return formattedTranscripts.join("\n");

  function resetNums() {
    (loop = 0), (chars = []), (charCount = 0), (timeSum = 0), (tempObj = {});
  }
}


// creates an array of objects { "start": "0.43", "duration": "2.64", "text": "transcript text" }
export async function getRawTranscript(link) {
  // Get Transcript
  const transcriptPageResponse = await fetch(link); // default 0
  const transcriptPageXml = await transcriptPageResponse.text();

  // Parse Transcript
  const parser = new DOMParser();
  const doc = parser.parseFromString(transcriptPageXml, "text/xml");
  const textNodes = doc.documentElement.childNodes;

  return Array.from(textNodes).map((i) => {
    return {
      start: i.getAttribute("start"),
      duration: i.getAttribute("dur"),
      text: i.textContent,
    };
  });
}

export async function getLangOptionsWithLink(videoId) {
  // Get a transcript URL
  const videoPageResponse = await fetch(
    "https://www.youtube.com/watch?v=" + videoId,
  );
  const videoPageHtml = await videoPageResponse.text();
  const splittedHtml = videoPageHtml.split('"captions":');

  if (splittedHtml.length < 2) {
    return;
  } // No Caption Available

  const captions_json = JSON.parse(
    splittedHtml[1].split(',"videoDetails')[0].replace("\n", ""),
  );
  const captionTracks =
    captions_json.playerCaptionsTracklistRenderer.captionTracks;
  const languageOptions = Array.from(captionTracks).map((i) => {
    return i.name.simpleText;
  });

  const first = "English"; // Sort by English first
  languageOptions.sort(function (x, y) {
    return x.includes(first) ? -1 : y.includes(first) ? 1 : 0;
  });
  languageOptions.sort(function (x, y) {
    return x == first ? -1 : y == first ? 1 : 0;
  });

  return Array.from(languageOptions).map((langName) => {
    const link = captionTracks.find(
      (i) => i.name.simpleText === langName,
    ).baseUrl;
    return {
      language: langName,
      link: link,
    };
  });
}

