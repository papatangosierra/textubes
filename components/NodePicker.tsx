import { NODE_REGISTRY } from "../nodeRegistry";
import { useRef } from "react";

type NodePickerProps = {
  onAddNode: (nodeType: string) => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  onExport: () => void;
  onImport: (event: React.ChangeEvent<HTMLInputElement>) => void;
};

export default function NodePicker({ onAddNode, isDarkMode, onToggleDarkMode, onExport, onImport }: NodePickerProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  // Group nodes by category
  const sources = Object.entries(NODE_REGISTRY).filter(([_, config]) => config.category === 'source');
  const transformers = Object.entries(NODE_REGISTRY).filter(([_, config]) => config.category === 'transformer');
  const destinations = Object.entries(NODE_REGISTRY).filter(([_, config]) => config.category === 'destination');

  return (
    <div className={`node-picker ${isDarkMode ? 'dark-mode' : ''}`}>
      <select
        className="node-picker-select"
        onChange={(e) => {
          const target = e.target as HTMLSelectElement;
          if (target.value) {
            onAddNode(target.value);
            target.value = "";
          }
        }}
        defaultValue=""
      >
        <option value="" disabled>
          Add node...
        </option>
        <optgroup label="Sources">
          {sources.map(([key, config]) => (
            <option key={key} value={key}>
              {config.label}
            </option>
          ))}
        </optgroup>
        <optgroup label="Transformers">
          {transformers.map(([key, config]) => (
            <option key={key} value={key}>
              {config.label}
            </option>
          ))}
        </optgroup>
        <optgroup label="Destinations">
          {destinations.map(([key, config]) => (
            <option key={key} value={key}>
              {config.label}
            </option>
          ))}
        </optgroup>
      </select>
      <button
        className="node-picker-button"
        onClick={onExport}
        title="Export flow as JSON"
      >
        💾
      </button>
      <button
        className="node-picker-button"
        onClick={() => fileInputRef.current?.click()}
        title="Import flow from JSON"
      >
        📂
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={onImport}
        style={{ display: 'none' }}
      />
      <button
        className="node-picker-button"
        onClick={onToggleDarkMode}
        title={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
      >
        {isDarkMode ? "☀️" : "🌙"}
      </button>
    </div>
  );
}
