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
document.addEventListener("DOMContentLoaded", () => {
	const tablinks = document.querySelectorAll(".tablinks");
	tablinks.forEach((tablink) => {
		tablink.addEventListener("click", (event) => {
			openTab(event, tablink.getAttribute("data-tab"));
		});
	});

	// Simulate a click on the first tab link to open it by default
	if (tablinks.length > 0) {
		tablinks[0].click();
	}
});

//////////////////////////////////////////////////////////////// custom shortcut
// Default shortcut (Ctrl + ')
// Should match with the one in index.js
const defaultUserShortcut = {
	ctrlKey: true,
	altKey: false,
	shiftKey: false,
	key: "'",
};
let userShortcut = defaultUserShortcut;

const shortcutInput = document.getElementById("shortcutInput");

function formatShortcut(s) {
	const parts = [];
	if (s.ctrlKey) parts.push("Ctrl");
	if (s.altKey) parts.push("Alt");
	if (s.shiftKey) parts.push("Shift");
	parts.push(s.key.length === 1 ? s.key.toUpperCase() : s.key);
	return parts.join(" + ");
}

shortcutInput.addEventListener("keydown", (e) => {
	e.preventDefault(); // Don't type into the input

	if (
		e.key === "Control" ||
		e.key === "Shift" ||
		e.key === "Alt" ||
		e.key === "Meta"
	) {
		return;
	}

	userShortcut = {
		ctrlKey: e.ctrlKey,
		altKey: e.altKey,
		shiftKey: e.shiftKey,
		key: e.key,
	};

	shortcutInput.value = formatShortcut(userShortcut);
});
////////////////////////////////////////////////////////////////

const saveOptions = () => {
	const placement = document.getElementById("container-placement").value;
	const copyAllContent = document.getElementById(
		"option_code_input_copy_all",
	).value;
	const copyChaptContent = document.getElementById(
		"option_code_input_copy_chapt",
	).value;
	const copyTimeContent = document.getElementById(
		"option_code_input_copy_nearby",
	).value;

	const status = document.getElementById("status");
	let savedTimer = null;

	browser.storage.local
		.set({
			customShortcut: userShortcut,
			placement: placement,
			copyAllContent: copyAllContent,
			copyChaptContent: copyChaptContent,
			copyTimeContent: copyTimeContent,
		})
		.then(() => {
			status.textContent = "Options saved.";
			if (savedTimer) {
				clearTimeout(savedTimer);
			}
			savedTimer = setTimeout(() => {
				status.textContent = "";
			}, 750);
		})
		.catch(() => {
			status.textContent = "Options not saved ERROR!";
			if (savedTimer) {
				clearTimeout(savedTimer);
			}
			savedTimer = setTimeout(() => {
				status.textContent = "";
			}, 750);
		});
};

const restoreOptions = () => {
	chrome.storage.local
		.get({
			customShortcut: defaultUserShortcut,
			placement: "sidebar",
			copyAllContent: "{{Transcript}}", // this should be same as getCustomWrapper
			copyChaptContent: "{{Transcript}}",
			copyTimeContent: "{{Transcript}}",
		})
		.then((items) => {
			document.getElementById("shortcutInput").value = formatShortcut(
				items.customShortcut,
			);
			document.getElementById("container-placement").value = items.placement;
			document.getElementById("option_code_input_copy_all").value =
				items.copyAllContent;
			document.getElementById("option_code_input_copy_chapt").value =
				items.copyChaptContent;
			document.getElementById("option_code_input_copy_nearby").value =
				items.copyTimeContent;
		})
		.catch((error) => {
			console.error("Error restoring options:", error);
		});
};

// Add event listener to the save button
document.getElementById("save_all").addEventListener("click", saveOptions);

document.addEventListener("DOMContentLoaded", restoreOptions);
/////////////////////////
