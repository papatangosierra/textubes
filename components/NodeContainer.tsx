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
}

export default function NodeContainer({
  id,
  selected,
  title,
  children,
  style,
  isDarkMode,
  category,
}: NodeContainerProps) {
  const { deleteElements } = useReactFlow();

  const handleDelete = () => {
    deleteElements({ nodes: [{ id }] });
  };

  const headerClass = category ? `node-header-${category}` : "";

  return (
    <div
      style={{
        border: selected
          ? isDarkMode
            ? "2px solid #888"
            : "2px solid #555"
          : isDarkMode
          ? "1px solid #555"
          : "1px solid #777",
        borderRadius: ".5rem",
        background: isDarkMode ? "#2a2a2a" : "white",
        minWidth: "150px",
        ...style,
      }}
    >
      <div
        className={headerClass}
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "6px 8px",
          borderRadius: ".5rem .5rem 0 0",
          borderBottom: isDarkMode ? "1px solid #444" : "1px solid #eee",
          background: isDarkMode ? "#333" : "#f9f9f9",
          color: isDarkMode ? "#e0e0e0" : "#000",
        }}
      >
        <div style={{ fontWeight: "bold", fontSize: "16px" }}>{title}</div>
        <button
          className="nodrag"
          onClick={handleDelete}
          style={{
            width: "16px",
            height: "16px",
            padding: 0,
            border: isDarkMode ? "1px solid #555" : "1px solid #ccc",
            borderRadius: ".5rem",
            background: isDarkMode ? "#3a3a3a" : "white",
            cursor: "pointer",
            fontSize: "12px",
            lineHeight: "14px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: isDarkMode ? "#aaa" : "#666",
            flexShrink: 0,
          }}
          title="Delete node"
        >
          ×
        </button>
      </div>
      <div style={{ padding: "10px" }}>{children}</div>
    </div>
  );
}
