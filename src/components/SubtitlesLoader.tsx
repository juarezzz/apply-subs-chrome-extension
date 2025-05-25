import React, { useState, ChangeEvent } from "react";
import { useSubtitles } from "../context/subtitles";

interface Subtitle {
  start: number;
  end: number;
  text: string;
}

const timeToMs = (timeString: string): number => {
  const [time, ms] = timeString.split(",");
  const [hours, minutes, seconds] = time.split(":").map(Number);

  return hours * 3600000 + minutes * 60000 + seconds * 1000 + parseInt(ms, 10);
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
        start: timeToMs(start),
        end: timeToMs(end),
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
      <h2>SRT File Parser</h2>

      <div>
        <input type="file" accept=".srt" onChange={handleFileUpload} />
        {error && <p>{error}</p>}
      </div>
    </div>
  );
};

export default SutitlesLoader;
