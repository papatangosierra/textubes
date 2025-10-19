import { Handle, Position, useNodesData, useReactFlow, type NodeProps, type Node, useNodeConnections } from '@xyflow/react';
import { useEffect } from 'react';
import type { NodeData } from '../App';
import { translateString } from '../types/unicodeAbuse';
import NodeContainer from './NodeContainer';
import { getNodeCategory } from '../nodeRegistry';

type UnicodeStyleNodeData = NodeData & {
  style?: string;
};

const STYLES = [
  { value: 'fullPitch', label: 'Full Width' },
  { value: 'circled', label: 'Circled' },
  { value: 'parens', label: 'Parentheses' },
  { value: 'bold', label: 'Bold' },
  { value: 'ital', label: 'Italic' },
  { value: 'boldital', label: 'Bold Italic' },
  { value: 'boldsans', label: 'Bold Sans' },
  { value: 'italsans', label: 'Italic Sans' },
  { value: 'bolditalsans', label: 'Bold Italic Sans' },
  { value: 'script', label: 'Script' },
  { value: 'boldscript', label: 'Bold Script' },
  { value: 'fraktur', label: 'Fraktur' },
  { value: 'doublestruck', label: 'Double-Struck' },
  { value: 'monospace', label: 'Monospace' },
  { value: 'negcircle', label: 'Negative Circle' },
  { value: 'negbox', label: 'Negative Box' },
  { value: 'box', label: 'Box' },
  { value: 'dotbox', label: 'Dot Box' },
];

export default function UnicodeStyleNode({ id, data, selected, type }: NodeProps<Node<UnicodeStyleNodeData>>) {
  const { updateNodeData } = useReactFlow();
  const connections = useNodeConnections({ handleType: 'target' });
  const sourceIds = connections.map((connection) => connection.source);
  const nodesData = useNodesData(sourceIds);

  const style = data.style ?? 'bold';

  // Extract input value
  const inputValue = sourceIds.length > 0
    ? ((nodesData[0]?.data as NodeData | undefined)?.value ?? '')
    : '';

  useEffect(() => {
    if (sourceIds.length === 0) {
      if (data.value !== '') {
        updateNodeData(id, { value: '' });
      }
      return;
    }

    // Apply the unicode transformation
    const transformed = translateString(inputValue);
    const outputValue = transformed[style as keyof typeof transformed] || inputValue;

    if (data.value !== outputValue) {
      updateNodeData(id, { value: outputValue });
    }
  }, [inputValue, style, sourceIds.length, id, updateNodeData, data.value]);

  return (
    <NodeContainer id={id} selected={selected} title="Unicode Abuse" style={{ minWidth: '180px' }} isDarkMode={data.isDarkMode} category={getNodeCategory(type)}>
      <Handle type="target" position={Position.Left} />
      <div className="node-description">
        Apply Unicode text styles
      </div>
      <div style={{ marginBottom: '5px' }} className="nodrag">
        <label style={{ fontSize: '11px', color: data.isDarkMode ? '#aaa' : '#666', display: 'block', marginBottom: '2px' }}>
          Style:
        </label>
        <select
          className="nodrag"
          value={style}
          onChange={(e) => updateNodeData(id, { style: e.target.value })}
          style={{
            width: '100%',
            padding: '4px',
            fontSize: '12px',
            border: data.isDarkMode ? '1px solid #555' : '1px solid #ccc',
            borderRadius: '.5rem',
            background: data.isDarkMode ? '#3a3a3a' : 'white',
            color: data.isDarkMode ? '#e0e0e0' : '#000'
          }}
        >
          {STYLES.map(s => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
      </div>

      <Handle type="source" position={Position.Right} />
    </NodeContainer>
  );
}
