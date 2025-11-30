import { Position, useReactFlow, type NodeProps, type Node } from '@xyflow/react';
import { useEffect, useRef } from 'react';
import type { NodeData } from '../App';
import NodeContainer from './NodeContainer';
import HelpLabel from './HelpLabel';
import { getNodeCategory, getNodeHelp } from '../nodeRegistry';

type RandomNodeData = NodeData & {
  length?: number;
  regenerateTimestamp?: number;
};

export default function RandomNode({ id, data, selected, type }: NodeProps<Node<RandomNodeData>>) {
  const { updateNodeData } = useReactFlow();
  const length = data.length ?? 10;
  const lastLengthRef = useRef<number | null>(null);
  const lastTimestampRef = useRef<number | undefined>(undefined);
  const helpInfo = getNodeHelp(type);

  // Function to generate random string
  const generateRandomString = (len: number) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let randomString = '';
    for (let i = 0; i < len; i++) {
      randomString += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return randomString;
  };

  useEffect(() => {
    // Skip on initial mount (value already generated in App.tsx)
    if (lastLengthRef.current === null) {
      lastLengthRef.current = length;
      return;
    }

    // Only generate if length has changed
    if (lastLengthRef.current === length) {
      return;
    }
    lastLengthRef.current = length;

    const randomString = generateRandomString(length);
    updateNodeData(id, { value: randomString });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [length]);

  // Handle regenerate trigger from upstream
  useEffect(() => {
    if (data.regenerateTimestamp && data.regenerateTimestamp !== lastTimestampRef.current) {
      lastTimestampRef.current = data.regenerateTimestamp;
      const randomString = generateRandomString(length);
      updateNodeData(id, { value: randomString });
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
        title="Random"
        isDarkMode={data.isDarkMode}
        category={getNodeCategory(type)}
        onHelpToggle={toggleHelp}
        helpActive={data.helpActive}
      >
        <div className="node-description">
          Generates random alphanumeric text
        </div>
        <div className="node-field">
          <label className="node-label">
            Length:
          </label>
          <input
            className="nodrag node-input"
            type="number"
            value={length}
            onChange={(e) => updateNodeData(id, { length: parseInt(e.target.value) || 0 })}
            min="0"
          />
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
