import { Position, useNodesData, useReactFlow, type NodeProps, type Node, useNodeConnections } from '@xyflow/react';
import { useEffect } from 'react';
import type { NodeData } from '../App';
import NodeContainer from './NodeContainer';
import HelpLabel from './HelpLabel';
import { getNodeCategory, getNodeHelp } from '../nodeRegistry';

type Rot13NodeData = NodeData & {
  shift?: number;
};

function caesarCipher(text: string, shift: number): string {
  return text.split('').map(char => {
    const code = char.charCodeAt(0);

    // Uppercase letters (A-Z)
    if (code >= 65 && code <= 90) {
      return String.fromCharCode(((code - 65 + shift) % 26) + 65);
    }
    // Lowercase letters (a-z)
    else if (code >= 97 && code <= 122) {
      return String.fromCharCode(((code - 97 + shift) % 26) + 97);
    }
    // Non-alphabetic characters remain unchanged
    else {
      return char;
    }
  }).join('');
}

export default function Rot13Node({ id, data, selected, type }: NodeProps<Node<Rot13NodeData>>) {
  const { updateNodeData } = useReactFlow();
  const connections = useNodeConnections({ handleType: 'target' });
  const sourceIds = connections.map((connection) => connection.source);
  const nodesData = useNodesData(sourceIds);
  const helpInfo = getNodeHelp(type);
  const shift = data.shift ?? 13;

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

    // Apply Caesar cipher
    const outputValue = caesarCipher(inputValue, shift);

    if (data.value !== outputValue) {
      updateNodeData(id, { value: outputValue });
    }
  }, [inputValue, sourceIds.length, id, updateNodeData, data.value, shift]);

  const toggleHelp = () => {
    updateNodeData(id, { helpActive: !data.helpActive });
  };

  return (
    <div className={`node-help-wrapper ${data.helpActive ? 'help-active' : ''}`}>
      {data.helpActive && helpInfo && (
        <div className="node-help-frame">
          <div
            className="help-description"
            dangerouslySetInnerHTML={{ __html: helpInfo.description }}
          />
        </div>
      )}

      <NodeContainer
        id={id}
        selected={selected}
        title="ROT13 / Caesar Cipher"
        isDarkMode={data.isDarkMode}
        category={getNodeCategory(type)}
        onHelpToggle={toggleHelp}
        helpActive={data.helpActive}
      >
        <HelpLabel
          type="target"
          position={Position.Left}
          helpActive={data.helpActive}
          helpLabel={helpInfo?.inputs?.[0]?.label}
          helpDescription={helpInfo?.inputs?.[0]?.description}
        />
        <div className="node-description">
          Rotate letters by {shift} {shift === 1 ? 'position' : 'positions'}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <label style={{ fontSize: '12px', color: data.isDarkMode ? '#e0e0e0' : '#000' }}>Shift:</label>
          <input
            type="range"
            className="nodrag"
            min="1"
            max="25"
            value={shift}
            onChange={(e) => updateNodeData(id, { shift: parseInt(e.target.value) })}
            style={{ flex: 1 }}
          />
          <span style={{ fontSize: '12px', minWidth: '25px', color: data.isDarkMode ? '#e0e0e0' : '#000' }}>{shift}</span>
        </div>
        <HelpLabel
          type="source"
          position={Position.Right}
          helpActive={data.helpActive}
          helpLabel={helpInfo?.outputs?.[0]?.label}
          helpDescription={helpInfo?.outputs?.[0]?.description}
        />
      </NodeContainer>
    </div>
  );
}
