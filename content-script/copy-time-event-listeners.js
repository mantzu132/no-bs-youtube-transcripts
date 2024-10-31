// COPY TRANSCRIPT OF SELECTED TIME RANGE FUNCTIONALITY (e.g 1:00 - 2:00 mins)
export async function attachTimeEventListeners() {
    let focusedInput = null;
    const ytSummaryMenu = document.querySelector("#yt_summary_menu");
    const progressBarContainer = document.querySelector(".ytp-progress-bar");

    // Define the click handler separately so we can add/remove the same function
    const handleProgressBarClick = (event) => {
        // Prevent default behavior if necessary
        if(event.target.closest('.ytp-progress-bar')){
            event.preventDefault();
            event.stopPropagation();

            const allYtpTooltips = Array.from(document.querySelectorAll(".ytp-tooltip-text"));

            focusedInput.value = allYtpTooltips[0].innerText
            focusedInput.blur();

        }

    };

    ytSummaryMenu.querySelectorAll(".input").forEach((input) => {
        input.addEventListener("focus", (event) => {
            focusedInput = event.target;
            // Add listener when input is focused
            progressBarContainer.addEventListener('pointerdown', handleProgressBarClick,{ capture: true,  });
        });

        input.addEventListener("blur", (event) => {
            if (event.relatedTarget && event.relatedTarget.closest('.ytp-progress-bar-container')) {
                event.preventDefault();
                return;
            }
            focusedInput = null;
            // Remove listener when input loses focus
            progressBarContainer.removeEventListener('pointerdown', handleProgressBarClick,{ capture: true });
        });
    });



}