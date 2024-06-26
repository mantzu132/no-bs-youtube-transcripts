export function copyTextToClipboard(text) {


  if (!navigator.clipboard) {

    fallbackCopyTextToClipboard(text);
  } else {
    window.focus();

    navigator.clipboard.writeText(text).then(
      function () {

      },
      function (err) {

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

    try {
      var successful = document.execCommand("copy");
      var msg = successful ? "Copy successful" : "Copy unsuccessful";

    } catch (err) {

    }

    document.body.removeChild(textArea);

  }
}
