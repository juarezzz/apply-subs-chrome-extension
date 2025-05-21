import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { SubtitlesProvider } from "./context/subtitles";
import { SubtitlesDisplay } from "./components/SubtitlesDisplay";
import SubtitlesLoader from "./components/SubtitlesLoader";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <SubtitlesProvider>
      <SubtitlesLoader />
      <SubtitlesDisplay />

      <iframe
        width="1333"
        height="750"
        src="https://www.youtube.com/embed/B77FQjm21vc"
        title="GANHEI DE UM PROFISSIONAL? - PES 2020"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        referrerPolicy="strict-origin-when-cross-origin"
        allowFullScreen
      ></iframe>
    </SubtitlesProvider>
  </StrictMode>
);
