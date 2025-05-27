import React, { useState, useRef, DragEvent, ChangeEvent } from "react";
import { Upload } from "lucide-react";
import styles from "./styles.module.css";
import { ErrorMessage } from "../ErrorMessage";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

interface FileInputProps {
  onFilesSelected: (files: File[]) => void;
}

export const FileInput: React.FC<FileInputProps> = ({ onFilesSelected }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragCounter = useRef(0);

  const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
    dragCounter.current += 1;
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    dragCounter.current -= 1;
    if (dragCounter.current === 0) setIsDragging(false);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const validateFiles = (
    fileList: File[]
  ): { valid: File[]; error?: string } => {
    const oversizedFiles = fileList.filter((file) => file.size > MAX_FILE_SIZE);
    if (oversizedFiles.length > 0) {
      const maxSizeMB = (MAX_FILE_SIZE / (1024 * 1024)).toFixed(2);
      return {
        valid: [],
        error: `File size must be less than ${maxSizeMB} MB`,
      };
    }

    const invalidTypeFiles = fileList.filter(
      (file) => !file.name.toLowerCase().endsWith(".srt")
    );
    if (invalidTypeFiles.length > 0) {
      return {
        valid: [],
        error: "Only .srt files are supported",
      };
    }

    return { valid: fileList };
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    setError("");

    const droppedFiles = Array.from(e.dataTransfer.files);

    if (droppedFiles.length > 1) {
      setError("Please drop only one file at a time");
      return;
    }

    const { valid, error } = validateFiles(droppedFiles);

    if (error) {
      setError(error);
      return;
    }

    onFilesSelected(valid);
  };

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    setError("");

    if (e.target.files && e.target.files.length > 0) {
      const selectedFiles = Array.from(e.target.files);
      const { valid, error } = validateFiles(selectedFiles);

      if (error) {
        setError(error);
        return;
      }

      onFilesSelected(valid);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + " B";
    else if (bytes < 1048576) return Math.round(bytes / 1024) + " KB";
    else return (bytes / 1048576).toFixed(2) + " MB";
  };

  return (
    <div className={styles.container}>
      <div
        className={`${styles.dropZone} ${isDragging ? styles.dragging : ""}`}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={".srt"}
          onChange={handleFileSelect}
          className={styles.hiddenInput}
        />

        <div className={styles.content}>
          <Upload className={styles.uploadIcon} />

          <div className={styles.textContainer}>
            <p className={styles.mainText}>
              Drop files here or click to upload
            </p>
            <p className={styles.subText}>Accepted formats: .srt</p>

            <p className={styles.subText}>
              Max size: {formatFileSize(MAX_FILE_SIZE)}
            </p>
          </div>
        </div>
      </div>

      <ErrorMessage error={error} setError={setError} />
    </div>
  );
};
