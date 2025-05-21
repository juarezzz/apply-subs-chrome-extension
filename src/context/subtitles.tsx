import { createContext, useContext, useState, ReactNode } from "react";

export interface Subtitle {
  start: number;
  end: number;
  text: string;
}

interface SubtitlesContextType {
  subtitles: Subtitle[];
  setSubtitles: (subs: Subtitle[]) => void;
}

const SubtitlesContext = createContext<SubtitlesContextType | undefined>(
  undefined
);

export const useSubtitles = () => {
  const context = useContext(SubtitlesContext);
  if (!context) {
    throw new Error("useSubtitles must be used within a SubtitlesProvider");
  }
  return context;
};

export const SubtitlesProvider = ({ children }: { children: ReactNode }) => {
  const [subtitles, setSubtitles] = useState<Subtitle[]>([]);

  return (
    <SubtitlesContext.Provider value={{ subtitles, setSubtitles }}>
      {children}
    </SubtitlesContext.Provider>
  );
};
