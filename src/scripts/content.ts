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

const DEFAULT_OFFSET = 80; //px;

class SubtitlesManager {
  private subtitles: Subtitle[] = [];
  private video: HTMLVideoElement | null = null;
  private subtitleElement: HTMLDivElement | null = null;

  init(target: VideoTarget, subtitles: Subtitle[]) {
    this.subtitles = subtitles;

    this.video = this.findTargetVideo(target);

    if (!this.video) {
      console.error("Target video not found", target);
      return false;
    }

    this.addSubtitleElement();

    this.attachEventListeners();
  }

  private addSubtitleElement() {
    if (!this.video) return false;

    const videoContainer = this.video.parentElement;

    if (!videoContainer) return false;

    this.subtitleElement = document.createElement("div");
    this.subtitleElement.style.cssText = `
      position: absolute;
      left: 50%;
      transform: translateX(-50%);
      color: white;
      font-size: 24px;
      text-align: center;
      z-index: 999999999;
    `;
    this.subtitleElement.id = "subtitle-element";

    this.updateSubtitlePosition();

    this.updateSubtitleContent();

    // Check if container has relative/absolute positioning
    const containerStyle = window.getComputedStyle(videoContainer);

    if (["absolute", "relative", "sticky"].includes(containerStyle.position))
      videoContainer.style.position = "relative";

    videoContainer.appendChild(this.subtitleElement);
  }

  private attachEventListeners() {
    if (!this.video) return false;

    this.video.addEventListener(
      "timeupdate",
      this.updateSubtitleContent.bind(this)
    );

    const resizeObserver = new ResizeObserver(() => {
      this.updateSubtitlePosition();
    });

    resizeObserver.observe(this.video);
  }

  private updateSubtitlePosition() {
    if (!this.subtitleElement || !this.video) return false;

    const { height } = this.video.getBoundingClientRect();

    const top = height - DEFAULT_OFFSET;

    this.subtitleElement.style.top = `${top}px`;
  }

  private updateSubtitleContent() {
    if (!this.subtitleElement || !this.video) return false;

    const currentTime = this.video.currentTime;

    const currentSubtitle = this.subtitles.find(
      (sub) => sub.start <= currentTime && sub.end >= currentTime
    );

    if (currentSubtitle) {
      this.subtitleElement.textContent = currentSubtitle.text;
      this.subtitleElement.style.display = "block";
    } else {
      this.subtitleElement.style.display = "none";
    }
  }

  private findTargetVideo(target: VideoTarget): HTMLVideoElement | null {
    const videos = Array.from(document.querySelectorAll("video"));

    if (target.videoId)
      return videos.find((v) => v.id === target.videoId) || null;

    if (target.videoIndex !== undefined)
      return videos[target.videoIndex] || null;

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

        // case "UPDATE_SUBTITLES":
        //   if (message.subtitles) {
        //     subtitleManager.updateSubtitles(message.subtitles);
        //     sendResponse({ success: true });
        //   } else {
        //     sendResponse({ success: false, error: "Missing subtitles data" });
        //   }
        //   break;

        // case "TOGGLE_SUBTITLES":
        //   if (message.visible !== undefined) {
        //     subtitleManager.toggleVisibility(message.visible);
        //     sendResponse({ success: true });
        //   } else {
        //     sendResponse({
        //       success: false,
        //       error: "Missing visibility parameter",
        //     });
        //   }
        //   break;

        // case "DESTROY_SUBTITLES":
        //   subtitleManager.destroy();
        //   sendResponse({ success: true });
        //   break;

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

// Cleanup on page unload
// window.addEventListener("beforeunload", () => {
//   subtitleManager.destroy();
// });
