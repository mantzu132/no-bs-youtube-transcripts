import { getRawTranscript, getTranscriptWithTime } from "./transcript.js";
import { showErrorToast, showSuccessToast } from "./utils.js";

export async function copyTranscript(videoId, customTimestamps, customWrapper) {
	let contentBody = "";
	const videoTitle = document.title;

	const rawTranscript = await getRawTranscript(
		window.noBsTranscripts.transcriptUrl,
	);

	let transcriptWithTime;

	// Filters raw transcript to include segments within custom start and end times, if provided
	if (customTimestamps) {
		const currentChapterTranscript = rawTranscript.filter(
			(item) =>
				item.start >= customTimestamps.start &&
				item.start <= customTimestamps.end + 1,
		);

		transcriptWithTime = getTranscriptWithTime(currentChapterTranscript);
	} else {
		// Else copy the whole transcript
		transcriptWithTime = getTranscriptWithTime(rawTranscript);
	}
	// Replace placeholders in the custom wrapper text
	contentBody = customWrapper
		.replace("{{Title}}", videoTitle)
		.replace("{{Transcript}}", transcriptWithTime);

	void copyTextToClipboard(contentBody);
}

export async function copyTextToClipboard(text) {
	try {
		await navigator.clipboard.writeText(text);
		showSuccessToast();
	} catch {
		showErrorToast("Problem copying text");
	}
}
