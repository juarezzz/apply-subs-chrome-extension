import { useEffect, useState } from "react";
import { getVideoElements } from "../../scripts/getVideoElements";
import { useSubtitles } from "../../context/subtitles";
import styles from "./styles.module.css";
import { RefreshCcw } from "lucide-react";
import { IconButton } from "../IconButton";

interface VideoElement {
  videoId: string;
  videoIndex: number;
  frameId: number;
  origin?: string;
  title?: string;
}

async function getCurrentTab() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  return tab;
}

export const SelectVideo = () => {
  const { subtitles } = useSubtitles();
  const [videoElements, setVideoElements] = useState<VideoElement[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<VideoElement>();
  const [isScanning, setIsScanning] = useState(false);
  const [animate, setAnimate] = useState(false);

  const detectVideoElements = async () => {
    setIsScanning(true);
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
        result!.map(({ id, origin, title }, i) => ({
          videoId: id,
          videoIndex: i,
          frameId,
          origin,
          title,
        }))
      );

      setVideoElements(videoElements);
    } catch (error) {
      console.error("Error scanning page for video elements:", error);
    } finally {
      setIsScanning(false);
    }
  };

  const handleShowSubtitles = async () => {
    const { id: tabId } = await getCurrentTab();

    if (!tabId) {
      console.error("No active tab found");
      return;
    }

    if (!selectedVideo) return;

    await chrome.tabs.sendMessage(
      tabId,
      {
        type: "ADD_SUBTITLES",
        target: {
          videoId: selectedVideo.videoId,
          videoIndex: selectedVideo.videoIndex,
          frameId: selectedVideo.frameId,
        },
        subtitles,
      },
      { frameId: selectedVideo.frameId }
    );
  };

  const handleVideoSelection = (video: VideoElement) => setSelectedVideo(video);

  useEffect(() => {
    detectVideoElements();
  }, []);

  return (
    <div className={styles.container}>
      <div className={styles.videosSection}>
        <div className={styles.header}>
          <h3 className={styles.videosTitle}>
            Videos on the page ({videoElements.length})
          </h3>

          <IconButton
            onClick={() => {
              setAnimate(true);
              detectVideoElements();
            }}
            disabled={isScanning}
            onAnimationEnd={() => setAnimate(false)}
            className={`${animate ? styles.spin : ""}`}
          >
            <RefreshCcw />
          </IconButton>
        </div>

        <div className={styles.videosList}>
          {videoElements.map((video, index) => (
            <div
              key={index}
              onClick={() => handleVideoSelection(video)}
              className={`${styles.videoItem} ${
                selectedVideo === video ? styles.selected : ""
              }`}
            >
              <div className={styles.videoTitle}>{video.title}</div>
              <div className={styles.videoDetails}>
                Origin: {video.origin || "Unknown"}
              </div>
            </div>
          ))}
        </div>

        {selectedVideo && (
          <button
            onClick={handleShowSubtitles}
            className={styles.showSubtitlesButton}
          >
            Show Subtitles on Selected Video
          </button>
        )}
      </div>
    </div>
  );
};
