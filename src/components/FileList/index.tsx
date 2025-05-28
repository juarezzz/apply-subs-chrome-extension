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

const formatDate = (timestamp: number) =>
  new Date(timestamp).toLocaleDateString();

export const FileList = () => {
  const [error, setError] = useState("");
  const { storedFiles, removeFile, getFile } = useStoredFiles();

  const { setSelectedFile } = useSubtitles();

  const handleSelectFile = async (fileId: string) => {
    const selectedFile = await getFile(fileId);

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
    <div className={styles.container}>
      <Title>Uploaded Files</Title>
      <ErrorMessage error={error} setError={setError} />
      <div className={styles.filesList}>
        {storedFiles.map((file) => (
          <ListItem
            key={file.id}
            title={file.name}
            details={`${formatFileSize(file.size)} • ${formatDate(
              file.uploadedAt
            )}`}
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
