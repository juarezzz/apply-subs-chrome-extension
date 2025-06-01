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
  const { saveFiles } = useStoredFiles();

  const [error, setError] = useState<string>("");

  const handleFilesSelected = async (files: File[]) => {
    if (!files || files.length === 0) {
      setError("No file selected");
      return;
    }

    try {
      const newFiles = await Promise.all(
        files.map(async (file) => {
          const content = await readFileContent(file);

          return {
            name: file.name,
            content,
            size: file.size,
          };
        })
      );

      const savedFiles = await saveFiles(newFiles);

      const firstFile = savedFiles[0];

      setSelectedFile({
        ...firstFile,
        content: parseSRT(firstFile.content),
      });

      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error processing file");
    }
  };

  const readFileContent = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e: ProgressEvent<FileReader>) => {
        const content = e.target?.result;
        if (typeof content !== "string") {
          reject(new Error("Failed to read file content"));
          return;
        }
        resolve(content);
      };

      reader.onerror = () => reject(new Error("Error reading file"));

      reader.readAsText(file);
    });
  };

  return (
    <div>
      <Title subtitle="Select one of your uploaded files or upload a new one.">
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
