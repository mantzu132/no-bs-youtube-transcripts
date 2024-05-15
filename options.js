import "./options.css";
//// TAB STUFF
export function openTab(evt, tabName) {
  let i, tabcontent, tablinks;

  // Get all elements with class="tabcontent" and hide them
  tabcontent = document.getElementsByClassName("tabcontent");
  for (i = 0; i < tabcontent.length; i++) {
    tabcontent[i].style.display = "none";
  }

  // Get all elements with class="tablinks" and remove the class "active"
  tablinks = document.getElementsByClassName("tablinks");
  for (i = 0; i < tablinks.length; i++) {
    tablinks[i].className = tablinks[i].className.replace(" active", "");
  }

  // Show the current tab, and add an "active" class to the button that opened the tab
  document.getElementById(tabName).style.display = "block";
  evt.currentTarget.className += " active";
}

// Open the first tab by default
document.addEventListener("DOMContentLoaded", function () {
  const tablinks = document.querySelectorAll(".tablinks");
  tablinks.forEach((tablink) => {
    tablink.addEventListener("click", function (event) {
      openTab(event, tablink.getAttribute("data-tab"));
    });
  });

  // Simulate a click on the first tab link to open it by default
  if (tablinks.length > 0) {
    tablinks[0].click();
  }
});

////////////////////////////////////////////////////////////////

//       Prompt for Summary
const saveOptions = () => {
  // Get the content from each textarea
  const copyAllContent = document.getElementById(
    "option_code_input_copy_all",
  ).value;
  const copyChaptContent = document.getElementById(
    "option_code_input_copy_chapt",
  ).value;
  const copyNearbyContent = document.getElementById(
    "option_code_input_copy_nearby",
  ).value;

  // Save the content to chrome.storage
  chrome.storage.local.set(
    {
      copyAllContent: copyAllContent,
      copyChaptContent: copyChaptContent,
      copyNearbyContent: copyNearbyContent,
    },
    () => {
      // Update status to let user know options were saved
      const status = document.getElementById("status");
      status.textContent = "Options saved.";
      setTimeout(() => {
        status.textContent = "";
      }, 750);
    },
  );
};

const restoreOptions = () => {
  chrome.storage.local.get(
    {
      copyAllContent: "{{Transcript}}", // this should be same as getCustomWrapper
      copyChaptContent: "{{Transcript}}",
      copyNearbyContent: "{{Transcript}}",
    },
    (items) => {
      document.getElementById("option_code_input_copy_all").value =
        items.copyAllContent;
      document.getElementById("option_code_input_copy_chapt").value =
        items.copyChaptContent;
      document.getElementById("option_code_input_copy_nearby").value =
        items.copyNearbyContent;
    },
  );
};

// Add event listener to the save button
document.getElementById("save_copy").addEventListener("click", saveOptions);

document.addEventListener("DOMContentLoaded", restoreOptions);
/////////////////////////
