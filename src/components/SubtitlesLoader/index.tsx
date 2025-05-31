import { useState } from "react";
import { X } from "lucide-react";
import { useSubtitles } from "../../context/subtitles";
import { FileInput } from "../FileInput";
import { ErrorMessage } from "../ErrorMessage";
import { useStoredFiles } from "../../context/storedFiles";
import { parseSRT } from "../../utils/parseSRT";
import { Title } from "../Title";
import { ListItem } from "../ListItem";
import styles from "./styles.module.css";

export const SubtitlesLoader = () => {
  const { selectedFile, setSelectedFile } = useSubtitles();
  const { saveFile } = useStoredFiles();

  const [error, setError] = useState<string>("");

  const handleFilesSelected = (files: File[]) => {
    const file = files[0];

    if (!file) {
      setError("No file selected");
      return;
    }

    const reader = new FileReader();

    reader.onload = async (e: ProgressEvent<FileReader>) => {
      try {
        const content = e.target?.result;
        if (typeof content !== "string") {
          throw new Error("Failed to read file content");
        }

        setError("");

        const newFile = await saveFile({
          name: file.name,
          size: file.size,
          content,
        });

        const subtitles = parseSRT(content);

        setSelectedFile({
          ...newFile,
          content: subtitles,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error processing file");
      }
    };

    reader.onerror = () => {
      setError("Error reading file");
    };

    reader.readAsText(file);
  };

  return (
    <div>
      <Title subtitle="Select one of your uploaded files or upload a new one">
        Subtitles
      </Title>
      {selectedFile && (
        <div className={styles.selectedFile}>
          <span>Selected:</span>
          <ListItem
            title={selectedFile.name}
            selected
            button={{
              icon: X,
              onClick: () => {
                setSelectedFile(undefined);
              },
            }}
          />
        </div>
      )}
      <FileInput onFilesSelected={handleFilesSelected} />
      <ErrorMessage error={error} setError={setError} />
    </div>
  );
};
