import { useState } from "react";
import { getVideoElements } from "../scripts/getVideoElements";
import { useSubtitles } from "../context/subtitles";

async function getCurrentTab() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  return tab;
}

export const SubtitlesDisplay = () => {
  const { subtitles } = useSubtitles();
  const [currentSubtitle] = useState<string>("");

  const handleShowSubtitles = async () => {
    const { id: tabId } = await getCurrentTab();

    if (!tabId) {
      console.error("No active tab found");
      return;
    }

    const results = await chrome.scripting.executeScript({
      target: {
        allFrames: true,
        tabId,
      },
      func: getVideoElements,
    });

    const nonEmptyResults = results.filter(
      ({ result }) => result && result.length > 0
    );

    const videoElements = nonEmptyResults.flatMap(
      ({ documentId, frameId, result }) =>
        result!.map(({ id, src }, i) => ({
          videoId: id,
          videoSrc: src,
          documentId,
          frameId,
          index: i,
        }))
    );
  };

  return (
    <div>
      <button onClick={handleShowSubtitles}>Show subtitles</button>
      <span>{currentSubtitle}</span>
    </div>
  );
};
