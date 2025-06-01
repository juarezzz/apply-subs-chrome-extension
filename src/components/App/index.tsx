import { useState } from "react";
import { Settings as Cog, Undo2 } from "lucide-react";
import { IconButton } from "../IconButton";
import { Settings } from "../Settings";
import { SubtitleManager } from "../SubtitleManager";
import styles from "./styles.module.css";

export const App = () => {
  const [page, setPage] = useState<"app" | "settings">("app");

  const handleTogglePage = () => {
    setPage((prevPage) => (prevPage === "app" ? "settings" : "app"));
  };

  return (
    <div className={styles.container}>
      <IconButton className={styles.pageButton} onClick={handleTogglePage}>
        {page === "app" && <Cog />}
        {page === "settings" && <Undo2 />}
      </IconButton>
      {page === "app" && <SubtitleManager />}
      {page === "settings" && <Settings />}
    </div>
  );
};
