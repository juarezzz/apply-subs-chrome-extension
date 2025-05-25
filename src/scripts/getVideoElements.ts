export const getVideoElements = () => {
  const videoElements = document.querySelectorAll("video");

  return [...videoElements].map((videoElement) => ({
    id: videoElement.id,
    src: videoElement.src,
  }));
};
