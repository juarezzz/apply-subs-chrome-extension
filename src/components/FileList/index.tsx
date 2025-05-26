import { X } from "lucide-react";
import { useStoredFiles } from "../../context/storedFiles";
import styles from "./styles.module.css";

export const FileList = () => {
  const { storedFiles, removeFile } = useStoredFiles();

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1048576) return Math.round(bytes / 1024) + " KB";
    return (bytes / 1048576).toFixed(2) + " MB";
  };

  const formatDate = (timestamp: number) =>
    new Date(timestamp).toLocaleDateString();

  if (storedFiles.length === 0) return null;

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>Uploaded Files</h3>
      <div className={styles.filesList}>
        {storedFiles.map((file) => (
          <div key={file.id} className={styles.fileItem}>
            <div className={styles.fileInfo}>
              <div className={styles.fileName}>{file.name}</div>
              <div className={styles.fileDetails}>
                {formatFileSize(file.size)} • {formatDate(file.uploadedAt)}
              </div>
            </div>
            <button
              onClick={() => removeFile(file.id)}
              className={styles.deleteButton}
              aria-label={`Delete ${file.name}`}
            >
              <X className={styles.deleteIcon} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
