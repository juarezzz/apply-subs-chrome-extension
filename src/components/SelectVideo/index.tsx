import { useEffect, useState } from "react";
import { getVideoElements } from "../../scripts/getVideoElements";
import { useSubtitles } from "../../context/subtitles";
import styles from "./styles.module.css";
import { RefreshCcw } from "lucide-react";
import { IconButton } from "../IconButton";
import { Title } from "../Title";
import { ListItem } from "../ListItem";
import { toggleVideoHighlight } from "../../scripts/toggleVideoHighlight";
import { findSubtitleElement } from "../../scripts/findSubtitleElement";
import { useStoredFiles } from "../../context/storedFiles";
import { parseSRT } from "../../utils/parseSRT";
import { shallowComparison } from "../../utils/shallowComparison";

interface VideoElement {
  videoId: string;
  videoIndex: number;
  videoSrc: string;
  frameId: number;
  origin?: string;
  title?: string;
}

interface SubtitlesConfig {
  subtitlesFileId: string;
  currentVideo: VideoElement;
}

async function getCurrentTab() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  return tab;
}

export const SelectVideo = () => {
  const { selectedFile, setSelectedFile } = useSubtitles();
  const { loadFile } = useStoredFiles();
  const [videoElements, setVideoElements] = useState<VideoElement[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<VideoElement>();
  const [currentSubtitlesConfig, setCurrentSubtitlesConfig] =
    useState<SubtitlesConfig>();
  const [isScanning, setIsScanning] = useState(false);
  const [animate, setAnimate] = useState(false);

  const isCurrentActiveConfig =
    selectedFile &&
    currentSubtitlesConfig?.subtitlesFileId === selectedFile.id &&
    currentSubtitlesConfig?.currentVideo &&
    selectedVideo &&
    shallowComparison(currentSubtitlesConfig.currentVideo, selectedVideo);

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
        result!.map(({ id, origin, title, src }, i) => ({
          videoId: id,
          videoIndex: i,
          videoSrc: src,
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

    if (!tabId) return;

    chrome.scripting.executeScript({
      target: { tabId, frameIds: [video.frameId] },
      func: toggleVideoHighlight,
      args: [{ toggle: "on", ...video }],
    });
  };

  const handleMouseLeave = async (video: VideoElement) => {
    if (!video) return;

    const { id: tabId } = await getCurrentTab();

    if (!tabId) return;

    chrome.scripting.executeScript({
      target: { tabId, frameIds: [video.frameId] },
      func: toggleVideoHighlight,
      args: [{ toggle: "off", ...video }],
    });
  };

  const handleRemoveSubtitles = async () => {
    const { id: tabId } = await getCurrentTab();

    if (!tabId) return;

    if (!selectedVideo || !selectedFile) return;

    await chrome.tabs.sendMessage(tabId, {
      type: "REMOVE_SUBTITLES",
    });

    setCurrentSubtitlesConfig(undefined);
  };

  const handleShowSubtitles = async () => {
    const { id: tabId } = await getCurrentTab();

    if (!tabId) return;

    if (!selectedVideo || !selectedFile) return;

    await chrome.tabs.sendMessage(tabId, {
      type: "REMOVE_SUBTITLES",
    });

    const response = await chrome.tabs.sendMessage(
      tabId,
      {
        type: "ADD_SUBTITLES",
        target: {
          videoId: selectedVideo.videoId,
          videoIndex: selectedVideo.videoIndex,
          frameId: selectedVideo.frameId,
        },
        subtitles: selectedFile.content,
        subtitlesFileId: selectedFile.id,
      },
      { frameId: selectedVideo.frameId }
    );

    if (!response?.success) return;

    setCurrentSubtitlesConfig({
      subtitlesFileId: selectedFile.id,
      currentVideo: selectedVideo,
    });
  };

  const handleVideoSelection = (video: VideoElement) => setSelectedVideo(video);

  useEffect(() => {
    if (!videoElements.length) return;

    const checkActiveSubtitles = async () => {
      const { id: tabId } = await getCurrentTab();

      if (!tabId) {
        console.error("No active tab found");
        return;
      }

      const results = await chrome.scripting.executeScript({
        target: { tabId, allFrames: true },
        func: findSubtitleElement,
      });

      const frameWithSubtitles = results.find(({ result }) => result);

      if (!frameWithSubtitles) return;

      const { frameId } = frameWithSubtitles;

      const response = await chrome.tabs.sendMessage(
        tabId,
        {
          type: "CHECK_ACTIVE_SUBTITLES",
        },
        { frameId: frameWithSubtitles.frameId }
      );

      if (!response || !response.subtitlesFileId) return;

      const { videoSrc, videoId, subtitlesFileId } = response;

      const file = await loadFile(subtitlesFileId);

      if (!file) return;

      const subtitles = parseSRT(file.content);

      setSelectedFile({
        ...file,
        content: subtitles,
      });

      const video = videoElements.find(
        (v) =>
          v.frameId === frameId &&
          v.videoId === videoId &&
          v.videoSrc === videoSrc
      );

      setSelectedVideo(video);

      if (!video) return;

      setCurrentSubtitlesConfig({
        subtitlesFileId,
        currentVideo: video,
      });
    };

    checkActiveSubtitles();
  }, [loadFile, setSelectedFile, videoElements]);

  useEffect(() => {
    detectVideoElements();
  }, []);

  const getButtonText = () => {
    if (!selectedFile) return "Select subtitles";

    if (isCurrentActiveConfig) return "Remove Subtitles";

    return "Show Subtitles";
  };

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
            onClick={
              isCurrentActiveConfig
                ? handleRemoveSubtitles
                : handleShowSubtitles
            }
            className={`${styles.showSubtitlesButton} ${
              isCurrentActiveConfig ? styles.remove : ""
            }`}
            disabled={!selectedFile}
          >
            {getButtonText()}
          </button>
        )}
      </div>
    </div>
  );
};
