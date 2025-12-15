import { Position, useNodesData, useReactFlow, type NodeProps, type Node, useNodeConnections } from '@xyflow/react';
import { useEffect } from 'react';
import type { NodeData } from '../App';
import NodeContainer from './NodeContainer';
import HelpLabel from './HelpLabel';
import { getNodeCategory, getNodeHelp } from '../nodeRegistry';

type ShuffleMode = 'character' | 'word' | 'line';

type ShuffleNodeData = NodeData & {
  mode?: ShuffleMode;
};

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function shuffleText(text: string, mode: ShuffleMode): string {
  switch (mode) {
    case 'character':
      return shuffleArray(text.split('')).join('');
    case 'word':
      return shuffleArray(text.split(/(\s+)/)).join('');
    case 'line':
      return shuffleArray(text.split('\n')).join('\n');
    default:
      return text;
  }
}

export default function ShuffleNode({ id, data, selected, type }: NodeProps<Node<ShuffleNodeData>>) {
  const { updateNodeData } = useReactFlow();
  const connections = useNodeConnections({ handleType: 'target' });
  const sourceIds = connections.map((connection) => connection.source);
  const nodesData = useNodesData(sourceIds);
  const helpInfo = getNodeHelp(type);
  const mode: ShuffleMode = data.mode ?? 'character';

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

    // Apply shuffle transformation (non-deterministic, so always update when inputs change)
    const outputValue = shuffleText(inputValue, mode);
    updateNodeData(id, { value: outputValue });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputValue, sourceIds.length, mode]);

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
        title="Shuffle"
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
          Randomly shuffle text
        </div>
        <select
          className="nodrag node-select"
          value={mode}
          onChange={(e) => updateNodeData(id, { mode: e.target.value as ShuffleMode })}
        >
          <option value="character">Shuffle Characters</option>
          <option value="word">Shuffle Words</option>
          <option value="line">Shuffle Lines</option>
        </select>
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
