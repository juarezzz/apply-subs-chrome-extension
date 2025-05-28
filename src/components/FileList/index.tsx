import { Trash2 } from "lucide-react";
import { useStoredFiles } from "../../context/storedFiles";
import styles from "./styles.module.css";
import { IconButton } from "../IconButton";
import { useSubtitles } from "../../context/subtitles";
import { ErrorMessage } from "../ErrorMessage";
import { useState } from "react";
import { parseSRT } from "../../utils/parseSRT";
import { Title } from "../Title";

const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1048576) return Math.round(bytes / 1024) + " KB";
  return (bytes / 1048576).toFixed(2) + " MB";
};

const formatDate = (timestamp: number) =>
  new Date(timestamp).toLocaleDateString();

export const FileList = () => {
  const [error, setError] = useState("");
  const { storedFiles, removeFile, getFile } = useStoredFiles();

  const { setSubtitles } = useSubtitles();

  const handleSelectFile = async (fileId: string) => {
    const selectedFile = await getFile(fileId);

    if (!selectedFile) {
      console.error("File not found:", fileId);

      setError(
        "Could not retrive selected file! Please try again or reupload the file."
      );

      return;
    }

    const subtitles = parseSRT(selectedFile.content);

    setSubtitles(subtitles);
  };

  if (storedFiles.length === 0) return null;

  return (
    <div className={styles.container}>
      <Title>Uploaded Files</Title>
      <ErrorMessage error={error} setError={setError} />
      <div className={styles.filesList}>
        {storedFiles.map((file) => (
          <div
            key={file.id}
            className={styles.fileItem}
            onClick={() => handleSelectFile(file.id)}
          >
            <div className={styles.fileInfo}>
              <div className={styles.fileName}>{file.name}</div>
              <div className={styles.fileDetails}>
                {formatFileSize(file.size)} • {formatDate(file.uploadedAt)}
              </div>
            </div>
            <IconButton
              onClick={() => removeFile(file.id)}
              className={styles.deleteButton}
              aria-label={`Delete ${file.name}`}
            >
              <Trash2 />
            </IconButton>
          </div>
        ))}
      </div>
    </div>
  );
};
