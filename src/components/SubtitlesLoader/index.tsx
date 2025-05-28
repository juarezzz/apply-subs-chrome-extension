import React, { useState } from "react";
import { useSubtitles } from "../../context/subtitles";
import { FileInput } from "../FileInput";
import { ErrorMessage } from "../ErrorMessage";
import { useStoredFiles } from "../../context/storedFiles";
import { parseSRT } from "../../utils/parseSRT";
import { Title } from "../Title";

export const SubtitlesLoader = () => {
  const { setSubtitles } = useSubtitles();
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
          throw new Error("Failed to read file content as string");
        }

        const fileContent = parseSRT(content);
        setSubtitles(fileContent);

        setError("");

        saveFile({
          name: file.name,
          size: file.size,
          content,
        }).catch((err) => {
          setError(
            `Error saving file: ${
              err instanceof Error ? err.message : "Unknown error"
            }`
          );
        });
      } catch (err) {
        setError(
          `Error parsing SRT file: ${
            err instanceof Error ? err.message : "Unknown error"
          }`
        );
        setSubtitles([]);
      }
    };

    reader.onerror = () => {
      setError("Error reading file");
      setSubtitles([]);
    };

    reader.readAsText(file);
  };

  return (
    <div>
      <Title subtitle="Select one of your uploaded files or upload a new one">
        Subtitles
      </Title>
      <FileInput onFilesSelected={handleFilesSelected} />
      <ErrorMessage error={error} setError={setError} />
    </div>
  );
};
