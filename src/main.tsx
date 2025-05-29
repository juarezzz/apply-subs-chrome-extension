import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { SubtitlesProvider } from "./context/subtitles";
import { StoredFilesProvider } from "./context/storedFiles";
import { App } from "./components/App";
import { SettingsProvider } from "./context/settings";
import "./main.css";

const Main = () => (
  <StrictMode>
    <StoredFilesProvider>
      <SubtitlesProvider>
        <SettingsProvider>
          <App />
        </SettingsProvider>
      </SubtitlesProvider>
    </StoredFilesProvider>
  </StrictMode>
);

createRoot(document.getElementById("root")!).render(<Main />);
