import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { SubtitlesProvider } from "./context/subtitles";
import { SubtitlesDisplay } from "./components/SubtitlesDisplay";
import { StoredFilesProvider } from "./context/storedFiles";
import { SubtitlesLoader } from "./components/SubtitlesLoader";
import "./main.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <StoredFilesProvider>
      <SubtitlesProvider>
        <SubtitlesLoader />
        <SubtitlesDisplay />
      </SubtitlesProvider>
    </StoredFilesProvider>
  </StrictMode>
);
