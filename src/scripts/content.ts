import { Subtitle } from "../context/subtitles";
import { SubtitleSettings } from "../context/settings";
import { isValidTimeOffset } from "../utils/isValidTimeOffset";
import { binarySearch } from "../utils/binarySearch";
import { DEFAULT_SUBTITLE_SETTINGS } from "../utils/defaultSubtitleSettings";

interface VideoTarget {
  frameId: number;
  documentId: string;
  videoIndex: number;
  videoId?: string;
}

interface SubtitleMessage {
  type:
    | "ADD_SUBTITLES"
    | "CHECK_ACTIVE_SUBTITLES"
    | "TOGGLE_SUBTITLES"
    | "REMOVE_SUBTITLES"
    | "UPDATE_SUBTITLE_SETTINGS";
  target?: VideoTarget;
  subtitlesFileId?: string;
  subtitles?: Subtitle[];
  visible?: boolean;
  settings?: SubtitleSettings;
}

class SubtitlesManager {
  private subtitles: Subtitle[] = [];
  private subtitlesFileId: string | null = null;
  private video: HTMLVideoElement | null = null;
  private subtitleElement: HTMLDivElement | null = null;
  private shadowHost: HTMLDivElement | null = null;
  private shadowRoot: ShadowRoot | null = null;
  private resizeObserver: ResizeObserver | null = null;
  private mutationObserver: MutationObserver | null = null;
  private scrollHandler: (() => void) | null = null;
  private fullscreenHandler: (() => void) | null = null;
  private isFullscreen: boolean = false;
  private settings: SubtitleSettings | null = null;
  private isHidden = false;

  async init(
    target: VideoTarget,
    subtitles: Subtitle[],
    subtitlesFileId: string
  ) {
    this.subtitles = subtitles;
    this.subtitlesFileId = subtitlesFileId;

    await this.loadSettings();

    this.video = this.findTargetVideo(target);

    if (!this.video) {
      console.error("Target video not found", target);
      return false;
    }

    this.addSubtitleElement();
    this.attachEventListeners();
    return true;
  }

  updateSettings(settings: SubtitleSettings) {
    this.settings = settings;
    if (this.subtitleElement) {
      this.applyStyles();
      this.updateSubtitlePosition();
      this.updateSubtitleContent();
    }
  }

  toggleSubtitles() {
    if (!this.subtitleElement) return;

    this.isHidden = !this.isHidden;

    this.subtitleElement.style.display = this.isHidden ? "none" : "block";

    this.updateSubtitleContent();
  }

  getActiveSubtitles() {
    if (!this.subtitleElement) return { video: null, subtitlesFileId: null };

    return {
      videoSrc: this.video?.src,
      videoId: this.video?.id,
      subtitlesFileId: this.subtitlesFileId,
    };
  }

  destroy() {
    this.removeEventListeners();
    this.removeSubtitleElement();

    this.subtitles = [];
    this.video = null;
    this.settings = null;
    this.isHidden = false;
    this.isFullscreen = false;
  }

  private async loadSettings() {
    try {
      const result = await chrome.storage.local.get("subtitleSettings");
      if (result.subtitleSettings) {
        this.settings = result.subtitleSettings;
      } else {
        this.settings = DEFAULT_SUBTITLE_SETTINGS;
      }
    } catch (error) {
      console.error("Error loading subtitle settings:", error);
    }
  }

  private addSubtitleElement() {
    if (!this.video || !this.settings) return false;

    // Remove existing subtitle element if it exists
    this.removeSubtitleElement();

    // Create shadow host element
    this.shadowHost = document.createElement("div");
    this.shadowHost.id = "subtitles-display-extension-shadow-host";

    // Style the shadow host - it will be positioned where subtitles should appear
    this.shadowHost.style.cssText = `
      position: absolute;
      z-index: 2147483647;
      transform: translateX(-50%) translateY(-100%);
    `;

    // Create shadow root with closed mode for better isolation
    this.shadowRoot = this.shadowHost.attachShadow({ mode: "open" });

    // Create the actual subtitle element
    this.subtitleElement = document.createElement("div");
    this.subtitleElement.id = "subtitles-display-extension-subtitle-element";

    this.applyStyles();
    this.updateSubtitlePosition();
    this.updateSubtitleContent();

    // Append subtitle element to shadow root
    this.shadowRoot.appendChild(this.subtitleElement);

    // Append shadow host to appropriate container based on fullscreen state
    this.appendSubtitleElement();
    return true;
  }

  private removeSubtitleElement() {
    if (this.shadowHost) {
      this.shadowHost.remove();
      this.shadowHost = null;
    }

    if (this.shadowRoot) this.shadowRoot = null;

    if (this.subtitleElement) this.subtitleElement = null;
  }

  private applyStyles() {
    if (!this.shadowHost || !this.subtitleElement || !this.settings) return;

    this.shadowHost.style.pointerEvents = this.settings.pointerEvents
      ? "all"
      : "none";

    const textShadow = this.settings.textShadow
      ? `2px 2px 4px ${this.settings.shadowColor}`
      : "none";

    const backgroundColor = this.settings.background
      ? this.settings.backgroundColor
      : "transparent";

    this.subtitleElement.style.cssText = `
      color: ${this.settings.fontColor};
      font-size: ${this.settings.fontSize}px;
      font-family: ${this.settings.fontFamily};
      padding: ${this.settings.verticalPadding}px ${this.settings.horizontalPadding}px;
      background-color: ${backgroundColor};
      text-shadow: ${textShadow};
      text-align: center;
      white-space: pre-line;
      font-weight: bold;
      line-height: 1.4;
      word-wrap: break-word;
    `;
  }

  private appendSubtitleElement() {
    if (!this.shadowHost) return;

    // Check if we're in fullscreen mode
    this.isFullscreen = !!document.fullscreenElement;

    if (this.isFullscreen) {
      // In fullscreen, append to the fullscreen element or its container
      const fullscreenElement = document.fullscreenElement;
      if (fullscreenElement) fullscreenElement.appendChild(this.shadowHost);
      else document.body.appendChild(this.shadowHost);
    }
    // Normal mode - append to document body
    else document.body.appendChild(this.shadowHost);
  }

  private updateSubtitlePosition() {
    if (!this.shadowHost || !this.video || !this.settings) return false;

    try {
      const videoRect = this.video.getBoundingClientRect();

      const subtitleTop =
        videoRect.bottom - this.settings.offsetFromBottom + window.scrollY;
      const subtitleLeft = videoRect.left + videoRect.width / 2;

      this.shadowHost.style.top = `${subtitleTop}px`;
      this.shadowHost.style.left = `${subtitleLeft}px`;

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

      const timeOffset = isValidTimeOffset(this.settings?.syncOffset)
        ? this.settings.syncOffset
        : 0;

      const adjustedTime = currentTime + timeOffset;

      const currentSubtitle = binarySearch(this.subtitles, (sub) => {
        if (sub.start > adjustedTime) return 1;
        if (sub.end < adjustedTime) return -1;
        return 0;
      });

      if (!currentSubtitle) {
        this.subtitleElement.textContent = null;
        this.subtitleElement.style.display = "none";
        return false;
      }

      if (!this.isHidden) this.subtitleElement.style.display = "block";

      this.subtitleElement.textContent = currentSubtitle.text;
      return true;
    } catch (error) {
      console.error("Error updating subtitle content:", error);
      return false;
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

    document.addEventListener("fullscreenchange", this.fullscreenHandler);

    // Add observer to detect if video is removed from DOM
    this.addVideoRemovalObserver();

    return true;
  }

  private removeEventListeners() {
    if (this.video) {
      this.video.removeEventListener(
        "timeupdate",
        this.updateSubtitleContent.bind(this)
      );
    }

    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }

    if (this.mutationObserver) {
      this.mutationObserver.disconnect();
      this.mutationObserver = null;
    }

    if (this.scrollHandler) {
      window.removeEventListener("scroll", this.scrollHandler);
      document.removeEventListener("scroll", this.scrollHandler);
      this.scrollHandler = null;
    }

    if (this.fullscreenHandler) {
      document.removeEventListener("fullscreenchange", this.fullscreenHandler);
      this.fullscreenHandler = null;
    }

    window.removeEventListener(
      "resize",
      this.updateSubtitlePosition.bind(this)
    );
  }

  private handleFullscreenChange() {
    const wasFullscreen = this.isFullscreen;

    this.isFullscreen = !!document.fullscreenElement;

    // If fullscreen state changed, re-append the shadow host element
    if (wasFullscreen !== this.isFullscreen) {
      if (this.shadowHost) {
        // Remove from current parent
        this.shadowHost.remove();

        // Re-append to appropriate container
        this.appendSubtitleElement();

        // Update positioning and styling for new context
        this.updateSubtitlePosition();
      }
    }
  }

  private addVideoRemovalObserver() {
    if (!this.video) return;

    this.mutationObserver = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === "childList") {
          // Check if any removed nodes contain the video element
          for (const removedNode of mutation.removedNodes) {
            if (this.isVideoRemovedFromNode(removedNode)) {
              this.destroy();
              return;
            }
          }
        }
      }
    });

    // Start observing the document for changes
    this.mutationObserver.observe(document.body, {
      childList: true,
      subtree: true,
    });
  }

  private isVideoRemovedFromNode(node: Node) {
    if (!this.video) return false;

    // Check if the removed node is the video itself
    if (node === this.video) {
      return true;
    }

    // Check if the removed node contains our video element
    if (node.nodeType === Node.ELEMENT_NODE) {
      const element = node as Element;
      return element.contains(this.video);
    }

    return false;
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

chrome.runtime.onMessage.addListener(
  (message: SubtitleMessage, _, sendResponse) => {
    try {
      switch (message.type) {
        case "ADD_SUBTITLES":
          if (message.target && message.subtitles && message.subtitlesFileId) {
            subtitleManager
              .init(message.target, message.subtitles, message.subtitlesFileId)
              .then((success) => {
                sendResponse({ success });
              })
              .catch((error) => {
                sendResponse({ success: false, error: error.message });
              });
          } else {
            sendResponse({
              success: false,
              error: "Missing target or subtitles data",
            });
          }
          break;

        case "UPDATE_SUBTITLE_SETTINGS":
          if (message.settings) {
            subtitleManager.updateSettings(message.settings);
            sendResponse({ success: true });
          } else {
            sendResponse({ success: false, error: "Missing settings data" });
          }
          break;

        case "TOGGLE_SUBTITLES":
          subtitleManager.toggleSubtitles();
          sendResponse({ success: true });
          break;

        case "REMOVE_SUBTITLES":
          subtitleManager.destroy();
          sendResponse({ success: true });
          break;

        case "CHECK_ACTIVE_SUBTITLES": {
          const activeSubtitles = subtitleManager.getActiveSubtitles();

          sendResponse({
            success: true,
            ...activeSubtitles,
          });
          break;
        }

        default:
          sendResponse({ success: false, error: "Unknown message type" });
      }
    } catch (error) {
      console.error("Error handling subtitle message:", error);
      sendResponse({ success: false, error: (error as Error).message });
    }
  }
);
