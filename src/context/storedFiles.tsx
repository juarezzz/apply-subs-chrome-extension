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

type StoredFileListItem = Omit<StoredFile, "content"> & { lastUsed: number };

type StoredFilesList = StoredFileListItem[];

type SaveFilesParams = {
  name: string;
  content: string;
  size: number;
}[];

interface StoredFilesContextType {
  storedFiles: StoredFilesList;
  filesLoading: boolean;
  saveFiles: (params: SaveFilesParams) => Promise<StoredFile[]>;
  removeFile: (id: string) => Promise<void>;
  loadFile: (id: string) => Promise<StoredFile | undefined>;
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

  const saveFiles = useCallback(
    async (files: SaveFilesParams) => {
      const currentTime = Date.now();

      const newFiles = files.map<StoredFile>(({ name, content, size }) => ({
        id: crypto.randomUUID(),
        name,
        content,
        size,
        uploadedAt: currentTime,
      }));

      const newFilesList = [
        ...storedFiles,
        ...newFiles.map((file) => ({
          ...file,
          content: undefined,
          lastUsed: currentTime,
        })),
      ];

      const filesMap = newFiles.reduce((acc, file) => {
        acc[file.id] = file;
        return acc;
      }, {} as Record<string, StoredFile>);

      await chrome.storage.local.set({
        ...filesMap,
        filesList: newFilesList,
      });

      setStoredFiles(newFilesList);

      return newFiles;
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

  const loadFile = useCallback(async (id: string) => {
    const result = await chrome.storage.local.get(id);

    const file = result[id] as StoredFile | undefined;

    if (file)
      setStoredFiles((currentFiles) => {
        const updatedFiles = currentFiles.map((f) =>
          f.id === id ? { ...f, lastUsed: Date.now() } : f
        );

        chrome.storage.local.set({ filesList: updatedFiles });

        return updatedFiles;
      });

    return file;
  }, []);

  const value = useMemo(
    () => ({
      storedFiles,
      saveFiles,
      filesLoading,
      removeFile,
      loadFile,
    }),
    [storedFiles, saveFiles, filesLoading, removeFile, loadFile]
  );

  return (
    <StoredFilesContext.Provider value={value}>
      {children}
    </StoredFilesContext.Provider>
  );
};
