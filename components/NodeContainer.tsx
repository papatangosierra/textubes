import { useReactFlow } from "@xyflow/react";
import type { ReactNode } from "react";

interface NodeContainerProps {
  id: string;
  selected?: boolean;
  title: string;
  children: ReactNode;
  style?: React.CSSProperties;
  isDarkMode?: boolean;
  category?: "source" | "transformer" | "destination";
  onHelpToggle?: () => void;
  helpActive?: boolean;
}

export default function NodeContainer({
  id,
  selected,
  title,
  children,
  style,
  isDarkMode,
  category,
  onHelpToggle,
  helpActive,
}: NodeContainerProps) {
  const { deleteElements } = useReactFlow();

  const handleDelete = () => {
    deleteElements({ nodes: [{ id }] });
  };

  const headerClass = category ? `node-header-${category}` : "";
  const containerClasses = [
    'node-container',
    isDarkMode ? 'dark-mode' : '',
    selected ? 'selected' : '',
  ].filter(Boolean).join(' ');

  return (
    <div className={containerClasses} style={style}>
      <div className={`node-header ${headerClass}`}>
        <div className="node-header-title">{title}</div>
        <div className="node-header-buttons">
          {onHelpToggle && (
            <button
              className="nodrag node-help-button"
              onClick={onHelpToggle}
              title={helpActive ? "Hide help" : "Show help"}
            >
              ?
            </button>
          )}
          <button
            className="nodrag node-delete-button"
            onClick={handleDelete}
            title="Delete node"
          >
            ×
          </button>
        </div>
      </div>
      <div className="node-body">{children}</div>
    </div>
  );
}
