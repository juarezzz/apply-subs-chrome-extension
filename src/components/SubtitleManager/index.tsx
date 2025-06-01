import { useEffect, useState } from "react";
import { SelectVideo } from "../SelectVideo";
import { SubtitlesLoader } from "../SubtitlesLoader";
import { FileList } from "../FileList";
import styles from "./styles.module.css";
import { Title } from "../Title";

type Command = "toggle-subtitle" | "toggle-sidebar";

const DEFAULT_COMMANDS: Record<Command, string> = {
  "toggle-subtitle": "Alt+Shift+C",
  "toggle-sidebar": "Alt+Shift+Q",
};

export const SubtitleManager = () => {
  const [commands, setCommands] = useState<chrome.commands.Command[]>([]);

  const toggleSubtitleCommand =
    commands.find((command) => command.name === "toggle-subtitle")?.shortcut ??
    DEFAULT_COMMANDS["toggle-subtitle"];

  const toggleSidebarCommand =
    commands.find((command) => command.name === "toggle-sidebar")?.shortcut ??
    DEFAULT_COMMANDS["toggle-sidebar"];

  useEffect(() => {
    const getCommands = async () => {
      const extensionCommands = await chrome.commands.getAll();

      setCommands(extensionCommands);
    };

    getCommands();
  }, []);

  const openShortcutsPage = () => {
    chrome.tabs.create({
      url: "chrome://extensions/shortcuts",
    });
  };

  return (
    <div className={styles.container}>
      <div>
        <Title>Display Subtitles</Title>
        <div>
          <p className={styles.description}>
            Subtitle appearance can be edited on the settings page. Use{" "}
            {toggleSubtitleCommand} to toggle subtitles and{" "}
            {toggleSidebarCommand} to open this sidebar. If these shortcuts
            don’t work or you want to change them, you can update them on{" "}
            <a onClick={openShortcutsPage}>this page</a>.
          </p>
        </div>
      </div>
      <SelectVideo />
      <SubtitlesLoader />
      <FileList />
    </div>
  );
};
