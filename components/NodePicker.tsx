import { NODE_REGISTRY } from "../nodeRegistry";

type NodePickerProps = {
  onAddNode: (nodeType: string) => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
};

export default function NodePicker({ onAddNode, isDarkMode, onToggleDarkMode }: NodePickerProps) {
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
        {Object.entries(NODE_REGISTRY).map(([key, config]) => (
          <option key={key} value={key}>
            {config.label}
          </option>
        ))}
      </select>
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
