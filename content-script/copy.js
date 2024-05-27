export function copyTextToClipboard(text) {
  console.log("Attempting to copy text:", text);

  if (!navigator.clipboard) {
    console.log("Clipboard API not available, using fallback method.");
    fallbackCopyTextToClipboard(text);
  } else {
    window.focus();
    console.log("Using Clipboard API to copy text.");
    navigator.clipboard.writeText(text).then(
      function () {
        console.log("Text successfully copied using Clipboard API.");
      },
      function (err) {
        console.error("Failed to copy text using Clipboard API:", err);
      },
    );
  }

  function fallbackCopyTextToClipboard(text) {
    console.log("Entering fallback method.");
    var textArea = document.createElement("textarea");
    textArea.value = text;

    // Avoid scrolling to bottom
    textArea.style.top = "0";
    textArea.style.left = "0";
    textArea.style.position = "fixed";

    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
      var successful = document.execCommand("copy");
      var msg = successful ? "Copy successful" : "Copy unsuccessful";
      console.log("Fallback copy was " + msg);
    } catch (err) {
      console.error("Error trying to copy text in fallback method:", err);
    }

    document.body.removeChild(textArea);
    console.log("Textarea removed from document.");
  }
}
