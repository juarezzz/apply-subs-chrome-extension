export const getVideoElements = () => {
  const videoElements = document.querySelectorAll("video");

  return [...videoElements].map((videoElement) => ({
    id: videoElement.id,
    src: videoElement.src,
    // Origin and title will come from the page or iframe
    origin: window.location.origin,
    title: document.title,
  }));
};
