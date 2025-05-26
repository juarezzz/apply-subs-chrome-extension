import { useState } from "react";
import { getVideoElements } from "../scripts/getVideoElements";

async function getCurrentTab() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  return tab;
}

export const SubtitlesDisplay = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [currentSubtitle] = useState<string>("");

  const handleShowSubtitles = async () => {
    setLoading(true);

    try {
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

      const videoElements = nonEmptyResults.flatMap(({ frameId, result }) =>
        result!.map(({ id }, i) => ({
          videoId: id,
          videoIndex: i,
          frameId,
        }))
      );

      const selectedVideo = videoElements[0]; // Select the first video element

      console.log("Selected video element:", selectedVideo);

      // Send message to initialize subtitles
      const response = await chrome.tabs.sendMessage(
        tabId,
        {
          type: "ADD_SUBTITLES",
          target: {
            videoId: selectedVideo.videoId,
            videoIndex: selectedVideo.videoIndex,
            frameId: selectedVideo.frameId,
          },
          subtitles: [], // Replace with your actual subtitles
        },
        { frameId: selectedVideo.frameId }
      );

      console.log("Subtitles initialized:", response);
    } catch (error) {
      console.error("Error fetching video elements:", error);
    }

    setLoading(false);
  };

  return (
    <div>
      <button onClick={handleShowSubtitles}>Show subtitles</button>
      <span>{currentSubtitle}</span>
    </div>
  );
};
