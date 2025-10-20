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
  category?: 'source' | 'transformer' | 'destination';
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
  category,
}: SelectorNodeUIProps) {
  return (
    <NodeContainer id={id} selected={selected_state} title={title} style={{ minWidth: '180px' }} isDarkMode={isDarkMode} category={category}>
      {description && (
        <div className="node-description">
          {description}
        </div>
      )}
      <div className="node-field">
        <label className="node-label">
          Select:
        </label>
        <select
          className="nodrag node-input"
          value={selected}
          onChange={(e) => onSelectionChange(e.target.value)}
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
