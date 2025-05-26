// Types for SRT files
interface StoredSRTFile {
  id: string;
  name: string;
  size: number;
  content: string; // Plain text content
  uploadedAt: number;
}

interface SRTFileMetadata {
  id: string;
  name: string;
  size: number;
  uploadedAt: number;
}

// Convert File to text string
const fileToText = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsText(file, "utf-8");
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

// Update the files list
const updateSRTFilesList = async (
  fileId: string,
  metadata: SRTFileMetadata
): Promise<void> => {
  const result = await chrome.storage.local.get(["srtFilesList"]);
  const filesList: SRTFileMetadata[] = result.srtFilesList || [];

  filesList.push(metadata);

  await chrome.storage.local.set({
    srtFilesList: filesList,
  });
};

// Get list of all stored SRT files
const getStoredSRTFilesList = async (): Promise<SRTFileMetadata[]> => {
  const result = await chrome.storage.local.get(["srtFilesList"]);
  return result.srtFilesList || [];
};

// Get a specific SRT file by ID
const getStoredSRTFile = async (
  fileId: string
): Promise<StoredSRTFile | null> => {
  const result = await chrome.storage.local.get([fileId]);
  return result[fileId] || null;
};

// Convert stored content back to File object (if needed)
const textToFile = (content: string, filename: string): File => {
  return new File([content], filename, { type: "text/plain" });
};

// Delete an SRT file from storage
const deleteStoredSRTFile = async (fileId: string): Promise<void> => {
  // Remove the file data
  await chrome.storage.local.remove([fileId]);

  // Update the files list
  const result = await chrome.storage.local.get(["srtFilesList"]);
  const filesList: SRTFileMetadata[] = result.srtFilesList || [];
  const updatedList = filesList.filter((file) => file.id !== fileId);

  await chrome.storage.local.set({
    srtFilesList: updatedList,
  });
};
