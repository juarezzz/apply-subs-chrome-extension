import React from "react";
import { useSettings, SubtitleSettings } from "../../context/settings";
import { MuiColorInput as ColorInput } from "mui-color-input";
import styles from "./styles.module.css";
import { Title } from "../Title";

export const Settings: React.FC = () => {
  const { settings, updateSettings, isLoading } = useSettings();

  const handleColorChange = (
    setting: "fontColor" | "backgroundColor" | "shadowColor",
    value: string
  ) => {
    updateSettings({ [setting]: value });
  };

  const handleNumberChange = (
    setting: keyof SubtitleSettings,
    value: string
  ) => {
    const numValue =
      setting === "syncOffset" ? parseFloat(value) : parseInt(value, 10);

    if (!isNaN(numValue)) {
      updateSettings({ [setting]: numValue });
    }
  };

  if (isLoading) {
    return <div className={styles.loading}>Loading settings...</div>;
  }

  return (
    <div>
      <Title>Settings</Title>
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Synchronization</h3>
        <div className={styles.settingRow}>
          <label className={styles.label}>Sync Offset</label>
          <div className={styles.inputGroup}>
            <input
              type="range"
              min="-60"
              max="60"
              value={settings.syncOffset}
              onChange={(e) => handleNumberChange("syncOffset", e.target.value)}
              className={styles.slider}
            />
            <span className={styles.value}>
              {settings.syncOffset > 0 ? "+" : ""}
              {settings.syncOffset}s
            </span>
          </div>
        </div>
      </div>

      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Subtitle Appearance</h3>

        <div className={styles.settingRow}>
          <label className={styles.label}>Font Size</label>
          <div className={styles.inputGroup}>
            <input
              type="range"
              min="10"
              max="100"
              value={settings.fontSize}
              onChange={(e) => handleNumberChange("fontSize", e.target.value)}
              className={styles.slider}
            />
            <span className={styles.value}>{settings.fontSize}px</span>
          </div>
        </div>

        <div className={styles.settingRow}>
          <label className={styles.label}>Font Color</label>
          <div className={styles.colorInputWrapper}>
            <ColorInput
              value={settings.fontColor}
              onChange={(value) => handleColorChange("fontColor", value)}
              format="hex8"
              className={styles.colorInput}
            />
            <span className={styles.colorValue}>{settings.fontColor}</span>
          </div>
        </div>

        <div className={styles.settingRow}>
          <label className={styles.label}>Font Family</label>
          <select
            value={settings.fontFamily}
            onChange={(e) => updateSettings({ fontFamily: e.target.value })}
            className={styles.select}
          >
            <option value="Arial, sans-serif">Arial</option>
            <option value="Helvetica, sans-serif">Helvetica</option>
            <option value="'Times New Roman', serif">Times New Roman</option>
            <option value="Georgia, serif">Georgia</option>
            <option value="'Courier New', monospace">Courier New</option>
            <option value="Verdana, sans-serif">Verdana</option>
            <option value="'Trebuchet MS', sans-serif">Trebuchet MS</option>
          </select>
        </div>

        <div className={styles.settingRow}>
          <label className={styles.label}>Background Color</label>
          <div className={styles.colorInputWrapper}>
            <input
              type="checkbox"
              checked={settings.background}
              onChange={(e) => updateSettings({ background: e.target.checked })}
              className={styles.checkbox}
            />

            <ColorInput
              value={settings.backgroundColor}
              format="hex8"
              onChange={(value) => {
                handleColorChange("backgroundColor", value);
              }}
              className={styles.colorInput}
            />
            <span className={styles.colorValue}>
              {settings.backgroundColor}
            </span>
          </div>
        </div>

        <div className={styles.settingRow}>
          <label className={styles.label}>Text Shadow</label>
          <div className={styles.colorInputWrapper}>
            <input
              type="checkbox"
              checked={settings.textShadow}
              onChange={(e) => updateSettings({ textShadow: e.target.checked })}
              className={styles.checkbox}
            />

            <ColorInput
              value={settings.shadowColor}
              format="hex8"
              onChange={(value) => handleColorChange("shadowColor", value)}
              className={styles.colorInput}
            />
            <span className={styles.colorValue}>{settings.shadowColor}</span>
          </div>
        </div>

        <div className={styles.settingRow}>
          <label className={styles.label}>Horizontal Padding</label>
          <div className={styles.inputGroup}>
            <input
              type="range"
              min="0"
              max="30"
              value={settings.horizontalPadding}
              onChange={(e) =>
                handleNumberChange("horizontalPadding", e.target.value)
              }
              className={styles.slider}
            />
            <span className={styles.value}>{settings.horizontalPadding}px</span>
          </div>
        </div>

        <div className={styles.settingRow}>
          <label className={styles.label}>Vertical Padding</label>
          <div className={styles.inputGroup}>
            <input
              type="range"
              min="0"
              max="30"
              value={settings.verticalPadding}
              onChange={(e) =>
                handleNumberChange("verticalPadding", e.target.value)
              }
              className={styles.slider}
            />
            <span className={styles.value}>{settings.verticalPadding}px</span>
          </div>
        </div>

        <div className={styles.settingRow}>
          <label className={styles.label}>Distance from Bottom</label>
          <div className={styles.inputGroup}>
            <input
              type="range"
              min="0"
              max="200"
              value={settings.offsetFromBottom}
              onChange={(e) =>
                handleNumberChange("offsetFromBottom", e.target.value)
              }
              className={styles.slider}
            />
            <span className={styles.value}>{settings.offsetFromBottom}px</span>
          </div>
        </div>

        <div className={styles.settingRow}>
          <label className={styles.label}>Selectable Text</label>
          <div className={styles.inputGroup}>
            <input
              type="checkbox"
              checked={settings.pointerEvents}
              onChange={(e) =>
                updateSettings({ pointerEvents: e.target.checked })
              }
              className={styles.checkbox}
            />
          </div>
        </div>
      </div>

      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Preview</h3>
        <div className={styles.previewContainer}>
          <div className={styles.videoPlaceholder}>
            <div
              className={styles.subtitlePreview}
              style={{
                fontSize: `${settings.fontSize}px`,
                color: settings.fontColor,
                backgroundColor: settings.background
                  ? settings.backgroundColor
                  : "transparent",
                fontFamily: settings.fontFamily,
                textShadow: settings.textShadow
                  ? `2px 2px 4px ${settings.shadowColor}`
                  : "none",
                padding: `${settings.verticalPadding}px ${settings.horizontalPadding}px`,
                pointerEvents: settings.pointerEvents ? "all" : "none",
              }}
            >
              Sample subtitle text
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
