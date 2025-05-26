import { Subtitle } from "../context/subtitles";
import { timeToSeconds } from "./timeToSeconds";

export const parseSRT = (content: string): Subtitle[] => {
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
