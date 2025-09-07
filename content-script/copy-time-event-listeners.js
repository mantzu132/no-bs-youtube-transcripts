// COPY TRANSCRIPT OF SELECTED TIME RANGE FUNCTIONALITY (e.g 1:00 - 2:00 mins)
export function attachTimeEventListeners() {
	let focusedInput = null;
	const ytSummaryMenu = document.querySelector("#yt_summary_menu");
	const progressBarContainer = document.querySelector(".ytp-progress-bar");

	// Define the click handler separately so we can add/remove the same function
	const handleProgressBarClick = (event) => {
		// Prevent default behavior if necessary
		if (event.target.closest(".ytp-progress-bar")) {
			event.preventDefault();

			const tooltip = document.querySelector(
				".ytp-tooltip-progress-bar-pill-time-stamp",
			);
			if (tooltip && focusedInput) {
				focusedInput.value = tooltip.innerText;
			}

			focusedInput.blur();
		}
	};

	ytSummaryMenu.querySelectorAll(".input").forEach((input) => {
		// TODO: Use event delegation
		input.addEventListener("focus", (event) => {
			focusedInput = event.target;
			// Add listener when input is focused
			progressBarContainer.addEventListener(
				"pointerdown",
				handleProgressBarClick,
			);
		});

		input.addEventListener("blur", (event) => {
			focusedInput = null;
			// Remove listener when input loses focus
			progressBarContainer.removeEventListener(
				"pointerdown",
				handleProgressBarClick,
			);
		});
	});
}
