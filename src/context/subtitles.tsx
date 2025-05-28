import { createContext, useContext, useState, ReactNode } from "react";
import { StoredFile } from "./storedFiles";

export interface Subtitle {
  start: number;
  end: number;
  text: string;
}

interface SubtitleFile extends Omit<StoredFile, "content"> {
  content: Subtitle[];
}

interface SubtitlesContextType {
  selectedFile?: SubtitleFile;
  setSelectedFile: (file: SubtitleFile | undefined) => void;
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
  const [selectedFile, setSelectedFile] = useState<SubtitleFile>();

  return (
    <SubtitlesContext.Provider value={{ selectedFile, setSelectedFile }}>
      {children}
    </SubtitlesContext.Provider>
  );
};
