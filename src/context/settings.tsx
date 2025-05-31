import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
  useCallback,
} from "react";

export interface SubtitleSettings {
  syncOffset: number; // in seconds
  fontSize: number; // in pixels
  fontColor: string; // hex color
  background: boolean;
  backgroundColor: string; // hex color with alpha
  fontFamily: string;
  offsetFromBottom: number; // in pixels
  textShadow: boolean;
  shadowColor: string;
  verticalPadding: number; // in pixels
  horizontalPadding: number; // in pixels
  pointerEvents: boolean; // allows text selection
}

export const DEFAULT_SETTINGS: SubtitleSettings = {
  syncOffset: 0,
  fontSize: 20,
  fontColor: "#ffffff",
  background: false,
  backgroundColor: "#000000",
  fontFamily: "Arial, sans-serif",
  offsetFromBottom: 60,
  textShadow: true,
  shadowColor: "#000000",
  verticalPadding: 8,
  horizontalPadding: 8,
  pointerEvents: true,
};

interface SettingsContextType {
  settings: SubtitleSettings;
  updateSettings: (newSettings: Partial<SubtitleSettings>) => Promise<void>;
  isLoading: boolean;
}

const SettingsContext = createContext<SettingsContextType | undefined>(
  undefined
);

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
};

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  const [settings, setSettings] = useState<SubtitleSettings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    chrome.storage.local
      .get("subtitleSettings")
      .then((result) => {
        if (result.subtitleSettings) {
          setSettings({ ...DEFAULT_SETTINGS, ...result.subtitleSettings });
        }
      })
      .catch((error) => {
        console.error("Error loading subtitle settings:", error);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const updateSettings = useCallback(
    async (newSettings: Partial<SubtitleSettings>) => {
      const updatedSettings = { ...settings, ...newSettings };

      try {
        await chrome.storage.local.set({ subtitleSettings: updatedSettings });
        setSettings(updatedSettings);

        const [tab] = await chrome.tabs.query({
          active: true,
          currentWindow: true,
        });

        if (tab.id) {
          chrome.tabs.sendMessage(tab.id, {
            type: "UPDATE_SUBTITLE_SETTINGS",
            settings: updatedSettings,
          });
        }
      } catch (error) {
        console.error("Error saving subtitle settings:", error);
        throw error;
      }
    },
    [settings]
  );

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, isLoading }}>
      {children}
    </SettingsContext.Provider>
  );
};
