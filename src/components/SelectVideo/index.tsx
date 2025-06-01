import { useEffect, useState } from "react";
import { getVideoElements } from "../../scripts/getVideoElements";
import { useSubtitles } from "../../context/subtitles";
import styles from "./styles.module.css";
import { RefreshCcw } from "lucide-react";
import { IconButton } from "../IconButton";
import { Title } from "../Title";
import { ListItem } from "../ListItem";
import { toggleVideoHighlight } from "../../scripts/toggleVideoHighlight";

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
  const { selectedFile } = useSubtitles();
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

  const handleMouseEnter = async (video: VideoElement) => {
    if (!video) return;

    const { id: tabId } = await getCurrentTab();

    if (!tabId) {
      console.error("No active tab found");
      return;
    }

    chrome.scripting.executeScript({
      target: { tabId, frameIds: [video.frameId] },
      func: toggleVideoHighlight,
      args: [{ toggle: "on", ...video }],
    });
  };

  const handleMouseLeave = async (video: VideoElement) => {
    if (!video) return;

    const { id: tabId } = await getCurrentTab();

    if (!tabId) {
      console.error("No active tab found");
      return;
    }

    chrome.scripting.executeScript({
      target: { tabId, frameIds: [video.frameId] },
      func: toggleVideoHighlight,
      args: [{ toggle: "off", ...video }],
    });
  };

  const handleShowSubtitles = async () => {
    const { id: tabId } = await getCurrentTab();

    if (!tabId) {
      console.error("No active tab found");
      return;
    }

    if (!selectedVideo || !selectedFile) return;

    await chrome.tabs.sendMessage(
      tabId,
      {
        type: "ADD_SUBTITLES",
        target: {
          videoId: selectedVideo.videoId,
          videoIndex: selectedVideo.videoIndex,
          frameId: selectedVideo.frameId,
        },
        subtitles: selectedFile.content,
      },
      { frameId: selectedVideo.frameId }
    );
  };

  const handleVideoSelection = (video: VideoElement) => setSelectedVideo(video);

  useEffect(() => {
    detectVideoElements();
  }, []);

  return (
    <div>
      <div
        className={styles.videosSection}
        // Remove margin from subtitle if it is displaying with no video
        style={videoElements.length ? {} : { marginBottom: -12 }}
      >
        <Title
          subtitle={
            videoElements.length
              ? "Select a video from the page to show subtitles. Hover over an option to highlight the video."
              : "Could not find any video on the page. If the page has changed, try scanning again."
          }
        >
          <div className={styles.header}>
            Videos on the page ({videoElements.length})
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
        </Title>

        <div className={styles.videosList}>
          {videoElements.map((video, index) => (
            <ListItem
              key={index}
              onClick={() => handleVideoSelection(video)}
              selected={selectedVideo === video}
              title={video.title || `Video ${index + 1}`}
              details={`Origin: ${video.origin || "Unknown"}`}
              onMouseEnter={() => handleMouseEnter(video)}
              onMouseLeave={() => handleMouseLeave(video)}
            />
          ))}
        </div>

        {selectedVideo && (
          <button
            onClick={handleShowSubtitles}
            className={styles.showSubtitlesButton}
            disabled={!selectedFile}
          >
            {!selectedFile ? "Select subtitles" : "Show Subtitles"}
          </button>
        )}
      </div>
    </div>
  );
};
