import { Handle, Position } from '@xyflow/react';
import NodeContainer from '../NodeContainer';

export type SelectorOption = {
  key: string;
  label: string;
  value: string;
};

type SelectorNodeUIProps = {
  id: string;
  selected_state?: boolean;
  title: string;
  description?: string;
  options: SelectorOption[];
  selected: string;
  onSelectionChange: (key: string) => void;
  isDarkMode?: boolean;
};

export default function SelectorNodeUI({
  id,
  selected_state,
  title,
  description,
  options,
  selected,
  onSelectionChange,
  isDarkMode,
}: SelectorNodeUIProps) {
  return (
    <NodeContainer id={id} selected={selected_state} title={title} style={{ minWidth: '180px' }} isDarkMode={isDarkMode}>
      {description && (
        <div className="node-description">
          {description}
        </div>
      )}
      <div style={{ marginBottom: '5px' }}>
        <label style={{ fontSize: '11px', color: isDarkMode ? '#aaa' : '#666', display: 'block', marginBottom: '2px' }}>
          Select:
        </label>
        <select
          className="nodrag"
          value={selected}
          onChange={(e) => onSelectionChange(e.target.value)}
          style={{
            width: '100%',
            padding: '4px',
            fontSize: '12px',
            border: isDarkMode ? '1px solid #555' : '1px solid #ccc',
            borderRadius: '3px',
            background: isDarkMode ? '#3a3a3a' : 'white',
            color: isDarkMode ? '#e0e0e0' : '#000'
          }}
        >
          {options.map((opt) => (
            <option key={opt.key} value={opt.key}>{opt.label}</option>
          ))}
        </select>
      </div>

      <Handle type="source" position={Position.Right} />
    </NodeContainer>
  );
}
