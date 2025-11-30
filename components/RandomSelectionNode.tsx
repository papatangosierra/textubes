import { Position, useNodesData, useReactFlow, type NodeProps, type Node, useNodeConnections } from '@xyflow/react';
import { useEffect, useRef } from 'react';
import type { NodeData } from '../App';
import NodeContainer from './NodeContainer';
import HelpLabel from './HelpLabel';
import { getNodeCategory, getNodeHelp } from '../nodeRegistry';

type RandomSelectionNodeData = NodeData & {
  mode?: 'character' | 'word' | 'line';
  regenerateTimestamp?: number;
};

const HANDLE_START = 4.45;

export default function RandomSelectionNode({ id, data, selected, type }: NodeProps<Node<RandomSelectionNodeData>>) {
  const { updateNodeData } = useReactFlow();
  const connections = useNodeConnections({ handleType: 'target' });
  const sourceIds = connections.map((connection) => connection.source);
  const nodesData = useNodesData(sourceIds);
  const helpInfo = getNodeHelp(type);
  const mode = data.mode ?? 'word';
  const lastInputRef = useRef<string>('');
  const lastModeRef = useRef<string>(mode);
  const lastTimestampRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (sourceIds.length === 0) {
      if (data.value !== '') {
        updateNodeData(id, { value: '' });
      }
      return;
    }

    const firstNode = nodesData[0];
    const inputData = firstNode?.data as NodeData | undefined;
    const inputValue = inputData?.value ?? '';

    // Only regenerate if input or mode changed
    if (lastInputRef.current === inputValue && lastModeRef.current === mode) {
      return;
    }
    lastInputRef.current = inputValue;
    lastModeRef.current = mode;

    if (!inputValue) {
      updateNodeData(id, { value: '' });
      return;
    }

    let outputValue = '';

    if (mode === 'character') {
      const randomIndex = Math.floor(Math.random() * inputValue.length);
      outputValue = inputValue[randomIndex];
    } else if (mode === 'word') {
      const words = inputValue.split(/\s+/).filter(w => w.length > 0);
      if (words.length > 0) {
        const randomIndex = Math.floor(Math.random() * words.length);
        outputValue = words[randomIndex];
      }
    } else if (mode === 'line') {
      const lines = inputValue.split('\n').filter(l => l.length > 0);
      if (lines.length > 0) {
        const randomIndex = Math.floor(Math.random() * lines.length);
        outputValue = lines[randomIndex];
      }
    }

    updateNodeData(id, { value: outputValue });
  }, [nodesData, sourceIds.length, mode, id, updateNodeData, data.value]);

  // Handle regenerate trigger from upstream
  useEffect(() => {
    if (data.regenerateTimestamp && data.regenerateTimestamp !== lastTimestampRef.current) {
      lastTimestampRef.current = data.regenerateTimestamp;

      // Force regeneration with current input
      const firstNode = nodesData[0];
      const inputData = firstNode?.data as NodeData | undefined;
      const inputValue = inputData?.value ?? '';

      if (!inputValue) {
        return;
      }

      let outputValue = '';

      if (mode === 'character') {
        const randomIndex = Math.floor(Math.random() * inputValue.length);
        outputValue = inputValue[randomIndex];
      } else if (mode === 'word') {
        const words = inputValue.split(/\s+/).filter(w => w.length > 0);
        if (words.length > 0) {
          const randomIndex = Math.floor(Math.random() * words.length);
          outputValue = words[randomIndex];
        }
      } else if (mode === 'line') {
        const lines = inputValue.split('\n').filter(l => l.length > 0);
        if (lines.length > 0) {
          const randomIndex = Math.floor(Math.random() * lines.length);
          outputValue = lines[randomIndex];
        }
      }

      updateNodeData(id, { value: outputValue });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.regenerateTimestamp]);

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
        title="Random Selection"
        isDarkMode={data.isDarkMode}
        category={getNodeCategory(type)}
        onHelpToggle={toggleHelp}
        helpActive={data.helpActive}
      >
        <HelpLabel
          type="target"
          position={Position.Left}
          style={{ top: `${HANDLE_START}rem` }}
          helpActive={data.helpActive}
          helpLabel={helpInfo?.inputs?.[0]?.label}
          helpDescription={helpInfo?.inputs?.[0]?.description}
        />
        <div className="node-description">
          Outputs a random selection from its input.
        </div>
        <div className="node-field">
          <label className="node-label">
            Select:
          </label>
          <select
            className="nodrag node-input"
            value={mode}
            onChange={(e) => updateNodeData(id, { mode: e.target.value as 'character' | 'word' | 'line' })}
          >
            <option value="character">Random Character</option>
            <option value="word">Random Word</option>
            <option value="line">Random Line</option>
          </select>
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
