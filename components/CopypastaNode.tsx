import { Handle, Position, useReactFlow, type NodeProps, type Node } from '@xyflow/react';
import { useEffect, useRef } from 'react';
import type { NodeData } from '../App';

type CopypastaNodeData = NodeData & {
  selected?: string;
};

const COPYPASTAS = {
  lorem: `Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.`,

  bee_movie: `According to all known laws of aviation, there is no way a bee should be able to fly. Its wings are too small to get its fat little body off the ground. The bee, of course, flies anyway because bees don't care what humans think is impossible.`,

  lorem_short: `The quick brown fox jumps over the lazy dog. Pack my box with five dozen liquor jugs. How vexingly quick daft zebras jump!`,

  sample: `This is sample text for testing your text transformation pipeline. It contains multiple sentences. Some are short. Others are a bit longer and more complex. You can use this to test various transformations and see how they work together.`,
};

const COPYPASTA_LABELS: Record<string, string> = {
  lorem: 'Lorem Ipsum',
  bee_movie: 'Bee Movie',
  lorem_short: 'Pangrams',
  sample: 'Sample Text',
};

export default function CopypastaNode({ id, data }: NodeProps<Node<CopypastaNodeData>>) {
  const { updateNodeData } = useReactFlow();
  const selected = data.selected ?? 'lorem';
  const lastSelectedRef = useRef<string | null>(null);

  useEffect(() => {
    // Skip on initial mount (value already pre-generated in nodeRegistry)
    if (lastSelectedRef.current === null) {
      lastSelectedRef.current = selected;
      return;
    }

    // Only update if selection changed
    if (lastSelectedRef.current === selected) {
      return;
    }
    lastSelectedRef.current = selected;

    const pastaValue = COPYPASTAS[selected as keyof typeof COPYPASTAS] || '';
    updateNodeData(id, { value: pastaValue });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected]);

  return (
    <div style={{
      padding: '10px',
      border: '1px solid #777',
      borderRadius: '3px',
      background: 'white',
      minWidth: '180px'
    }}>
      <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>Copypasta</div>

      <div style={{ marginBottom: '5px' }}>
        <label style={{ fontSize: '11px', color: '#666', display: 'block', marginBottom: '2px' }}>
          Select:
        </label>
        <select
          className="nodrag"
          value={selected}
          onChange={(e) => updateNodeData(id, { selected: e.target.value })}
          style={{
            width: '100%',
            padding: '4px',
            fontSize: '12px',
            border: '1px solid #ccc',
            borderRadius: '3px'
          }}
        >
          {Object.entries(COPYPASTA_LABELS).map(([key, label]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </select>
      </div>

      <Handle type="source" position={Position.Right} />
    </div>
  );
}
