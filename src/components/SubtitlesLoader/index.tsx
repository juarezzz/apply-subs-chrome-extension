import React, { useState, ChangeEvent } from "react";
import { useSubtitles } from "../../context/subtitles";
import { FileInput } from "../FileInput";

interface Subtitle {
  start: number; // seconds
  end: number; // seconds
  text: string;
}

const timeToSeconds = (timeString: string): number => {
  const [time, ms] = timeString.split(",");
  const [hours, minutes, seconds] = time.split(":").map(Number);

  return hours * 3600 + minutes * 60 + seconds + parseInt(ms, 10) / 1000;
};

const parseSRT = (content: string): Subtitle[] => {
  const blocks = content.trim().split(/\r?\n\r?\n/);

  return blocks
    .map((block) => {
      const lines = block.split(/\r?\n/);

      const timestampLine = lines[1];
      const [timeRange] =
        timestampLine.match(
          /\d{2}:\d{2}:\d{2},\d{3} --> \d{2}:\d{2}:\d{2},\d{3}/g
        ) || [];

      if (!timeRange) return null;

      const [start, end] = timeRange.split(" --> ");

      const text = lines.slice(2).join("\n");

      return {
        start: timeToSeconds(start),
        end: timeToSeconds(end),
        text: text,
      };
    })
    .filter((subtitle): subtitle is Subtitle => subtitle !== null);
};

const SutitlesLoader: React.FC = () => {
  const { setSubtitles } = useSubtitles();

  const [error, setError] = useState<string>("");

  const handleFileUpload = (event: ChangeEvent<HTMLInputElement>): void => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    if (!file.name.endsWith(".srt")) {
      setError("Please upload a .srt file");
      setSubtitles([]);
      return;
    }

    const reader = new FileReader();

    reader.onload = (e: ProgressEvent<FileReader>) => {
      try {
        const content = e.target?.result;
        if (typeof content !== "string") {
          throw new Error("Failed to read file content as string");
        }

        const parsed = parseSRT(content);
        setSubtitles(parsed);
        setError("");
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
      <FileInput
        onFilesSelected={(files) => {
          console.log("Files selected:", files);
        }}
      />
      {error && <p>{error}</p>}
    </div>
  );
};

export default SutitlesLoader;
