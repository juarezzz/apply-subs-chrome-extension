interface Params {
  videoId: string;
  videoIndex: number;
  toggle: "on" | "off";
}

export const toggleVideoHighlight = ({
  videoId,
  videoIndex,
  toggle,
}: Params) => {
  let targetVideo: HTMLVideoElement | undefined;

  const videos = Array.from(document.querySelectorAll("video"));

  if (videoId) targetVideo = videos.find((v) => v.id === videoId);

  if (videoIndex !== undefined) targetVideo = videos[videoIndex];

  if (!targetVideo) {
    console.error("No video found with the specified parameters");
    return;
  }

  const videoContainer = targetVideo.parentElement;

  if (!videoContainer) {
    console.error("Target video has no parent element");
    return;
  }

  if (toggle === "off") {
    const existingHighlight = document.querySelector(
      "#video-highlight-element"
    );
    if (existingHighlight) videoContainer.removeChild(existingHighlight);
    return;
  }

  const highlight = document.createElement("div");
  highlight.id = "video-highlight-element";
  highlight.style.cssText = `
    position: absolute;
    inset: 0;
    pointer-events: none;
    z-index: 9999;
    background-color: rgba(67, 112, 188, 0.55);
`;

  const containerStyle = window.getComputedStyle(videoContainer);

  if (!["absolute", "relative", "sticky"].includes(containerStyle.position))
    videoContainer.style.position = "relative";

  const { height: containerHeight, width: containerWidth } =
    videoContainer.getBoundingClientRect();
  const { height: videoHeight, width: videoWidth } =
    targetVideo.getBoundingClientRect();

  const height = containerHeight || videoHeight;
  const width = containerWidth || videoWidth;

  highlight.style.width = `${width}px`;
  highlight.style.height = `${height}px`;

  videoContainer.appendChild(highlight);
};
