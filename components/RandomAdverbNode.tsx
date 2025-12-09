import { Position, useReactFlow, type NodeProps, type Node } from '@xyflow/react';
import { useEffect, useRef, useState } from 'react';
import type { NodeData } from '../App';
import NodeContainer from './NodeContainer';
import HelpLabel from './HelpLabel';
import { getNodeCategory, getNodeHelp } from '../nodeRegistry';

// Module-level cache so all instances share the same word list
const wordListCache = new Map<string, string[]>();

type RandomAdverbNodeData = NodeData & {
  regenerateTimestamp?: number;
};

export default function RandomAdverbNode({ id, data, selected, type }: NodeProps<Node<RandomAdverbNodeData>>) {
  const { updateNodeData } = useReactFlow();
  const [words, setWords] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const lastGenerateRef = useRef<boolean>(false);
  const lastTimestampRef = useRef<number | undefined>(undefined);
  const helpInfo = getNodeHelp(type);

  // Load word list on mount
  useEffect(() => {
    const cached = wordListCache.get('adverbs');
    if (cached) {
      setWords(cached);
      setLoading(false);
      return;
    }

    fetch('/textubes/wordlists/adverbs.json')
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to load word list');
        }
        return response.json();
      })
      .then((data: string[]) => {
        wordListCache.set('adverbs', data);
        setWords(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error loading adverbs:', err);
        setError('Failed to load word list');
        setLoading(false);
      });
  }, []);

  // Generate initial random adverb when words are loaded
  useEffect(() => {
    if (loading || error || words.length === 0) {
      return;
    }

    // Skip if we've already generated (value pre-set in nodeRegistry)
    if (lastGenerateRef.current) {
      return;
    }
    lastGenerateRef.current = true;

    // Only generate if we don't already have a value
    if (!data.value) {
      const randomAdverb = words[Math.floor(Math.random() * words.length)];
      updateNodeData(id, { value: randomAdverb });
    }
  }, [loading, error, words, data.value, id, updateNodeData]);

  const regenerate = () => {
    if (words.length > 0) {
      const randomAdverb = words[Math.floor(Math.random() * words.length)];
      updateNodeData(id, { value: randomAdverb });
    }
  };

  // Handle regenerate trigger from upstream
  useEffect(() => {
    if (data.regenerateTimestamp && data.regenerateTimestamp !== lastTimestampRef.current) {
      lastTimestampRef.current = data.regenerateTimestamp;
      regenerate();
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
        title="Random Adverb"
        isDarkMode={data.isDarkMode}
        category={getNodeCategory(type)}
        onHelpToggle={toggleHelp}
        helpActive={data.helpActive}
      >
        <div className="node-description">
          Generates a random adverb
        </div>

        {loading && (
          <div className="node-status loading">
            Loading words...
          </div>
        )}

        {error && (
          <div className="node-status error">
            {error}
          </div>
        )}

        {!loading && !error && (
          <button
            className="nodrag node-button-wide"
            onClick={regenerate}
          >
            Generate New
          </button>
        )}

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
