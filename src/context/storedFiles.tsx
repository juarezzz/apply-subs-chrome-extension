import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
  useCallback,
  useMemo,
} from "react";

export interface StoredFile {
  id: string;
  name: string;
  content: string;
  size: number;
  uploadedAt: number;
}

type StoredFilesList = Omit<StoredFile, "content">[];

interface StoredFilesContextType {
  storedFiles: StoredFilesList;
  filesLoading: boolean;
  saveFile: (params: saveFileParams) => Promise<StoredFile>;
  removeFile: (id: string) => Promise<void>;
  getFile: (id: string) => Promise<StoredFile | undefined>;
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

      return newFile;
    },
    [storedFiles]
  );

  const removeFile = useCallback(
    async (id: string) => {
      const updatedFilesList = storedFiles.filter((file) => file.id !== id);
      await chrome.storage.local.remove([id]);
      await chrome.storage.local.set({
        filesList: updatedFilesList,
      });
      setStoredFiles(updatedFilesList);
    },
    [storedFiles]
  );

  const getFile = useCallback(async (id: string) => {
    const file = await chrome.storage.local.get(id);
    return file[id] as StoredFile | undefined;
  }, []);

  const value = useMemo(
    () => ({
      storedFiles,
      saveFile,
      filesLoading,
      removeFile,
      getFile,
    }),
    [storedFiles, saveFile, filesLoading, removeFile, getFile]
  );

  return (
    <StoredFilesContext.Provider value={value}>
      {children}
    </StoredFilesContext.Provider>
  );
};
