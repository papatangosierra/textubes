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
  options: SelectorOption[];
  selected: string;
  onSelectionChange: (key: string) => void;
};

export default function SelectorNodeUI({
  id,
  selected_state,
  title,
  options,
  selected,
  onSelectionChange,
}: SelectorNodeUIProps) {
  return (
    <NodeContainer id={id} selected={selected_state} style={{ minWidth: '180px' }}>
      <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>{title}</div>

      <div style={{ marginBottom: '5px' }}>
        <label style={{ fontSize: '11px', color: '#666', display: 'block', marginBottom: '2px' }}>
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
            border: '1px solid #ccc',
            borderRadius: '3px'
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
