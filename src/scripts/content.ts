import { Subtitle } from "../context/subtitles";

interface VideoTarget {
  frameId: number;
  documentId: string;
  videoIndex: number;
  videoId?: string;
}

interface SubtitleMessage {
  type:
    | "ADD_SUBTITLES"
    | "UPDATE_SUBTITLES"
    | "TOGGLE_SUBTITLES"
    | "DESTROY_SUBTITLES";
  target?: VideoTarget;
  subtitles?: Subtitle[];
  visible?: boolean;
}

const DEFAULT_OFFSET = 0.15; // % from video height

class SubtitlesManager {
  private subtitles: Subtitle[] = [];
  private video: HTMLVideoElement | null = null;
  private subtitleElement: HTMLDivElement | null = null;
  private resizeObserver: ResizeObserver | null = null;
  private scrollHandler: (() => void) | null = null;
  private fullscreenHandler: (() => void) | null = null;
  private isFullscreen: boolean = false;

  init(target: VideoTarget, subtitles: Subtitle[]) {
    this.subtitles = subtitles;

    this.video = this.findTargetVideo(target);

    if (!this.video) {
      console.error("Target video not found", target);
      return false;
    }

    this.addSubtitleElement();
    this.attachEventListeners();
    return true;
  }

  private addSubtitleElement() {
    if (!this.video) return false;

    // Remove existing subtitle element if it exists
    this.removeSubtitleElement();

    this.subtitleElement = document.createElement("div");
    this.subtitleElement.style.cssText = `
      position: absolute;
      color: white;
      font-size: 24px;
      text-align: center;
      z-index: 2147483647;
      white-space: pre-line;
      text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
      font-family: Arial, sans-serif;
      font-weight: bold;
      line-height: 1.2;
    `;
    this.subtitleElement.id = "subtitle-element";

    this.updateSubtitlePosition();
    this.updateSubtitleContent();

    // Append to appropriate container based on fullscreen state
    this.appendSubtitleElement();
    return true;
  }

  private appendSubtitleElement() {
    if (!this.subtitleElement) return;

    // Check if we're in fullscreen mode
    this.isFullscreen = !!document.fullscreenElement;

    if (this.isFullscreen) {
      // In fullscreen, append to the fullscreen element or its container
      const fullscreenElement = document.fullscreenElement;
      if (fullscreenElement)
        fullscreenElement.appendChild(this.subtitleElement);
      else document.body.appendChild(this.subtitleElement);
    }
    // Normal mode - append to document body
    else document.body.appendChild(this.subtitleElement);
  }

  private removeSubtitleElement() {
    if (this.subtitleElement) {
      this.subtitleElement.remove();
      this.subtitleElement = null;
    }
  }

  private attachEventListeners() {
    if (!this.video) return false;

    this.video.addEventListener(
      "timeupdate",
      this.updateSubtitleContent.bind(this)
    );

    // Use ResizeObserver to watch for video size changes
    this.resizeObserver = new ResizeObserver(() => {
      this.updateSubtitlePosition();
    });
    this.resizeObserver.observe(this.video);

    window.addEventListener("resize", this.updateSubtitlePosition.bind(this), {
      passive: true,
    });

    // Listen for scroll events to update position
    this.scrollHandler = () => {
      this.updateSubtitlePosition();
    };

    // Listen for scroll on both window and document
    window.addEventListener("scroll", this.scrollHandler, { passive: true });
    document.addEventListener("scroll", this.scrollHandler, { passive: true });

    // Listen for fullscreen changes
    this.fullscreenHandler = () => {
      this.handleFullscreenChange();
    };

    // Add fullscreen event listeners for different browsers
    document.addEventListener("fullscreenchange", this.fullscreenHandler);
    document.addEventListener("webkitfullscreenchange", this.fullscreenHandler);
    document.addEventListener("mozfullscreenchange", this.fullscreenHandler);
    document.addEventListener("MSFullscreenChange", this.fullscreenHandler);

    return true;
  }

  private handleFullscreenChange() {
    const wasFullscreen = this.isFullscreen;

    this.isFullscreen = !!document.fullscreenElement;

    // If fullscreen state changed, re-append the subtitle element
    if (wasFullscreen !== this.isFullscreen) {
      if (this.subtitleElement) {
        // Remove from current parent
        this.subtitleElement.remove();

        // Re-append to appropriate container
        this.appendSubtitleElement();

        // Update positioning and styling for new context
        this.updateSubtitlePosition();
      }
    }
  }

  private updateSubtitlePosition() {
    if (!this.subtitleElement || !this.video) return false;

    try {
      const videoRect = this.video.getBoundingClientRect();

      const subtitleTop =
        videoRect.bottom - DEFAULT_OFFSET * videoRect.height + window.scrollY;
      const subtitleLeft = videoRect.left + videoRect.width / 2;

      this.subtitleElement.style.top = `${subtitleTop}px`;
      this.subtitleElement.style.left = `${subtitleLeft}px`;
      this.subtitleElement.style.transform = "translateX(-50%)";

      return true;
    } catch (error) {
      console.error("Error updating subtitle position:", error);
      return false;
    }
  }

  private updateSubtitleContent() {
    if (!this.subtitleElement || !this.video) return false;

    try {
      const currentTime = this.video.currentTime;

      const currentSubtitle = this.subtitles.find(
        (sub) => sub.start <= currentTime && sub.end >= currentTime
      );

      this.subtitleElement.textContent = currentSubtitle?.text || null;

      return true;
    } catch (error) {
      console.error("Error updating subtitle content:", error);
      return false;
    }
  }

  private findTargetVideo(target: VideoTarget): HTMLVideoElement | null {
    const videos = Array.from(document.querySelectorAll("video"));

    if (target.videoId) {
      return videos.find((v) => v.id === target.videoId) || null;
    }

    if (target.videoIndex !== undefined) {
      return videos[target.videoIndex] || null;
    }

    // Return first video if no specific target
    return videos[0] || null;
  }
}

const subtitleManager = new SubtitlesManager();

// Message listener
chrome.runtime.onMessage.addListener(
  (message: SubtitleMessage, _, sendResponse) => {
    try {
      switch (message.type) {
        case "ADD_SUBTITLES":
          if (message.target && message.subtitles) {
            const success = subtitleManager.init(
              message.target,
              message.subtitles
            );
            sendResponse({ success });
          } else {
            sendResponse({
              success: false,
              error: "Missing target or subtitles data",
            });
          }
          break;

        default:
          sendResponse({ success: false, error: "Unknown message type" });
      }
    } catch (error) {
      console.error("Error handling subtitle message:", error);
      sendResponse({ success: false, error: (error as Error).message });
    }

    return true;
  }
);
