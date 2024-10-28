import {getLangOptionsWithLink, getRawTranscript, getTranscriptWithTime} from "./transcript.js";
import {showErrorToast, showSuccessToast} from "./utils.js";


export async function copyTranscript(videoId, customTimestamps, customWrapper) {
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
              item.start  <= customTimestamps.end +1  ,
      );

      transcriptWithTime = await getTranscriptWithTime(currentChapterTranscript);
    } else {
      // Else copy the whole transcript
      transcriptWithTime = await getTranscriptWithTime(rawTranscript);
    }
    // Replace placeholders in the custom wrapper text
    contentBody = customWrapper
        .replace("{{Title}}", videoTitle)
        .replace("{{Transcript}}", transcriptWithTime);

    copyTextToClipboard(contentBody);

  }




export function copyTextToClipboard(text) {

  if (!navigator.clipboard) {
    fallbackCopyTextToClipboard(text);
  } else {
    window.focus();

    navigator.clipboard.writeText(text).then(
      function () {

        showSuccessToast();

      },
      function (err) {

        showErrorToast()

      },
    );
  }

  function fallbackCopyTextToClipboard(text) {

    var textArea = document.createElement("textarea");
    textArea.value = text;

    // Avoid scrolling to bottom
    textArea.style.top = "0";
    textArea.style.left = "0";
    textArea.style.position = "fixed";

    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();


      var successful = document.execCommand("copy");
      var msg = successful ? showSuccessToast() : showErrorToast();


    document.body.removeChild(textArea);

  }
}


