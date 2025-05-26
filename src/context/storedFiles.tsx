import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
  useCallback,
  useMemo,
} from "react";

interface StoredFile {
  id: string;
  name: string;
  content: string;
  size: number;
  uploadedAt: number;
}

type StoredFilesList = Omit<StoredFile, "content">[];

interface StoredFilesContextType {
  storedFiles: StoredFilesList;
  saveFile: (params: saveFileParams) => Promise<void>;
  filesLoading: boolean;
}

interface saveFileParams {
  name: string;
  content: string;
  size: number;
}

const StoredFilesContext = createContext<StoredFilesContextType | undefined>(
  undefined
);

export const useStoredFiles = () => {
  const context = useContext(StoredFilesContext);
  if (!context)
    throw new Error("useStoredFiles must be used within a StoredFilesProvider");

  return context;
};

export const StoredFilesProvider = ({ children }: { children: ReactNode }) => {
  const [storedFiles, setStoredFiles] = useState<StoredFilesList>([]);
  const [filesLoading, setFilesLoading] = useState(true);

  useEffect(() => {
    chrome.storage.local
      .get("filesList")
      .then((result) => {
        console.log("Fetched stored files:", JSON.stringify(result));
        const filesList = result.filesList || [];
        setStoredFiles(filesList);
      })
      .catch((error) => {
        console.error("Error fetching stored files:", error);
      })
      .finally(() => setFilesLoading(false));
  }, []);

  const saveFile = useCallback(
    async ({ content, name, size }: saveFileParams) => {
      const id = crypto.randomUUID();

      const newFile: StoredFile = {
        id,
        name,
        content,
        size,
        uploadedAt: Date.now(),
      };

      const newFilesList = [
        ...storedFiles,
        { ...newFile, content: undefined }, // Exclude content from the list
      ];

      await chrome.storage.local.set({
        [id]: newFile,
        filesList: newFilesList,
      });

      setStoredFiles(newFilesList);
    },
    [storedFiles]
  );

  const value = useMemo(
    () => ({
      storedFiles,
      saveFile,
      filesLoading,
    }),
    [storedFiles, saveFile, filesLoading]
  );

  return (
    <StoredFilesContext.Provider value={value}>
      {children}
    </StoredFilesContext.Provider>
  );
};
