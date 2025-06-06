import { Trash2 } from "lucide-react";
import { useStoredFiles } from "../../context/storedFiles";
import styles from "./styles.module.css";
import { useSubtitles } from "../../context/subtitles";
import { ErrorMessage } from "../ErrorMessage";
import { useState } from "react";
import { parseSRT } from "../../utils/parseSRT";
import { Title } from "../Title";
import { ListItem } from "../ListItem";

const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1048576) return Math.round(bytes / 1024) + " KB";
  return (bytes / 1048576).toFixed(2) + " MB";
};

export const FileList = () => {
  const [error, setError] = useState("");
  const { storedFiles, removeFile, loadFile } = useStoredFiles();

  const { setSelectedFile } = useSubtitles();

  const handleSelectFile = async (fileId: string) => {
    const selectedFile = await loadFile(fileId);

    if (!selectedFile) {
      console.error("File not found:", fileId);

      setError(
        "Could not retrieve selected file! Please try again or reupload the file."
      );

      return;
    }

    const subtitles = parseSRT(selectedFile.content);

    setSelectedFile({
      ...selectedFile,
      content: subtitles,
    });
  };

  if (storedFiles.length === 0) return null;

  return (
    <div>
      <Title subtitle="Files you have uploaded are stored on your browser local storage for easy access.">
        Uploaded Files
      </Title>
      <ErrorMessage error={error} setError={setError} />
      <div className={styles.filesList}>
        {storedFiles
          .sort((a, b) => b.lastUsed - a.lastUsed)
          .map((file) => (
            <ListItem
              key={file.id}
              title={file.name}
              details={`File size: ${formatFileSize(file.size)}`}
              selected={false}
              onClick={() => handleSelectFile(file.id)}
              button={{
                icon: Trash2,
                onClick: () => {
                  removeFile(file.id);
                },
              }}
            />
          ))}
      </div>
    </div>
  );
};
