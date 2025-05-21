import { useState } from "react";
import { useSubtitles } from "../context/subtitles";

export const SubtitlesDisplay = () => {
  const { subtitles } = useSubtitles();
  const [currentSubtitle, setCurrentSubtitle] = useState<string>("");

  const handleShowSubtitles = () => {};

  return (
    <div>
      <button onClick={handleShowSubtitles}>Show subtitles</button>
      <span>{currentSubtitle}</span>
    </div>
  );
};
