import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { SubtitlesProvider } from "./context/subtitles";
import { SelectVideo } from "./components/SelectVideo";
import { StoredFilesProvider } from "./context/storedFiles";
import { SubtitlesLoader } from "./components/SubtitlesLoader";
import { FileList } from "./components/FileList";
import "./main.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <StoredFilesProvider>
      <SubtitlesProvider>
        <SubtitlesLoader />
        <SelectVideo />
        <FileList />
      </SubtitlesProvider>
    </StoredFilesProvider>
  </StrictMode>
);
