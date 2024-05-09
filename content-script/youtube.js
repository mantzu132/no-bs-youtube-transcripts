import './main.css'
import {dayName, dayNumber } from './transcript.js'

import { createIcons, Copy } from 'lucide';

waitForElm('#secondary.style-scope.ytd-watch-flexy').then(() =>
    {
        document.querySelector("#secondary.style-scope.ytd-watch-flexy").insertAdjacentHTML("afterbegin", `
        <div class="yt_summary_container">
            <div id="yt_summary_header" class="yt_summary_header">
                <p class="yt_summary_header_text">Transcript</p>
                <div class="yt_summary_header_actions">
                    <div id="yt_summary_header_copy" class="yt_summary_header_action_btn yt-summary-hover-el" data-hover-label="Copy Transcript">
                        <i data-lucide="copy">a</i>
                    </div>
                </div>
            </div>
        </div>`)

        createIcons({
            icons: {
               Copy
            }
        });
    }
)


function waitForElm(selector) {
    return new Promise(resolve => {
        if (document.querySelector(selector)) {
            return resolve(document.querySelector(selector));
        }

        const observer = new MutationObserver(mutations => {
            if (document.querySelector(selector)) {
                resolve(document.querySelector(selector));
                observer.disconnect();
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    });
}