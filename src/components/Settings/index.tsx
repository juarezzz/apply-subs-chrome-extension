import React from "react";
import { useSettings } from "../../context/settings";
import styles from "./styles.module.css";

export const Settings: React.FC = () => {
  const { settings, updateSettings, isLoading } = useSettings();

  const handleColorChange = (
    setting: "fontColor" | "backgroundColor" | "shadowColor",
    value: string
  ) => {
    updateSettings({ [setting]: value });
  };

  const handleNumberChange = (
    setting:
      | "fontSize"
      | "offsetFromBottom"
      | "padding"
      | "borderRadius"
      | "opacity",
    value: string
  ) => {
    const numValue =
      setting === "opacity" ? parseFloat(value) : parseInt(value, 10);

    if (!isNaN(numValue)) {
      updateSettings({ [setting]: numValue });
    }
  };

  if (isLoading) {
    return <div className={styles.loading}>Loading settings...</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>Settings</h2>
      </div>

      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Text Appearance</h3>

        <div className={styles.settingRow}>
          <label className={styles.label}>Font Size</label>
          <div className={styles.inputGroup}>
            <input
              type="range"
              min="12"
              max="48"
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
            <input
              type="color"
              value={settings.fontColor}
              onChange={(e) => handleColorChange("fontColor", e.target.value)}
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
      </div>

      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Background & Effects</h3>

        <div className={styles.settingRow}>
          <label className={styles.label}>Background Color</label>
          <div className={styles.colorInputWrapper}>
            <input
              type="color"
              value={settings.backgroundColor.slice(0, 7)}
              onChange={(e) => {
                const alpha = settings.backgroundColor.slice(7) || "aa";
                handleColorChange("backgroundColor", e.target.value + alpha);
              }}
              className={styles.colorInput}
            />
            <input
              type="range"
              min="0"
              max="255"
              value={parseInt(settings.backgroundColor.slice(7) || "aa", 16)}
              onChange={(e) => {
                const color = settings.backgroundColor.slice(0, 7);
                const alpha = parseInt(e.target.value)
                  .toString(16)
                  .padStart(2, "0");
                handleColorChange("backgroundColor", color + alpha);
              }}
              className={styles.alphaSlider}
              title="Background opacity"
            />
          </div>
        </div>

        <div className={styles.settingRow}>
          <label className={styles.label}>Text Shadow</label>
          <div className={styles.checkboxWrapper}>
            <input
              type="checkbox"
              checked={settings.textShadow}
              onChange={(e) => updateSettings({ textShadow: e.target.checked })}
              className={styles.checkbox}
            />
            {settings.textShadow && (
              <input
                type="color"
                value={settings.shadowColor}
                onChange={(e) =>
                  handleColorChange("shadowColor", e.target.value)
                }
                className={styles.colorInput}
              />
            )}
          </div>
        </div>
      </div>

      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Position & Layout</h3>

        <div className={styles.settingRow}>
          <label className={styles.label}>Padding</label>
          <div className={styles.inputGroup}>
            <input
              type="range"
              min="0"
              max="20"
              value={settings.padding}
              onChange={(e) => handleNumberChange("padding", e.target.value)}
              className={styles.slider}
            />
            <span className={styles.value}>{settings.padding}px</span>
          </div>
        </div>

        <div className={styles.settingRow}>
          <label className={styles.label}>Distance from Bottom</label>
          <div className={styles.inputGroup}>
            <input
              type="range"
              min="20"
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
      </div>

      <div className={styles.preview}>
        <h3 className={styles.sectionTitle}>Preview</h3>
        <div className={styles.previewContainer}>
          <div className={styles.videoPlaceholder}>
            <div
              className={styles.subtitlePreview}
              style={{
                fontSize: `${settings.fontSize}px`,
                color: settings.fontColor,
                backgroundColor: settings.backgroundColor,
                fontFamily: settings.fontFamily,
                bottom: `${settings.offsetFromBottom}px`,
                textShadow: settings.textShadow
                  ? `2px 2px 4px ${settings.shadowColor}`
                  : "none",
                padding: `${settings.padding}px`,
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
