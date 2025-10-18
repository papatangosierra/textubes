import { Handle, Position, useReactFlow, type NodeProps, type Node } from '@xyflow/react';
import { useEffect, useRef, useState } from 'react';
import type { NodeData } from '../App';
import NodeContainer from './NodeContainer';

// Module-level cache so all instances share the same word list
const wordListCache = new Map<string, string[]>();

export default function RandomNounNode({ id, data, selected }: NodeProps<Node<NodeData>>) {
  const { updateNodeData } = useReactFlow();
  const [words, setWords] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const lastGenerateRef = useRef<boolean>(false);

  // Load word list on mount
  useEffect(() => {
    const cached = wordListCache.get('nouns');
    if (cached) {
      setWords(cached);
      setLoading(false);
      return;
    }

    fetch('/textubes/wordlists/nouns.json')
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to load word list');
        }
        return response.json();
      })
      .then((data: string[]) => {
        wordListCache.set('nouns', data);
        setWords(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error loading nouns:', err);
        setError('Failed to load word list');
        setLoading(false);
      });
  }, []);

  // Generate initial random noun when words are loaded
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
      const randomNoun = words[Math.floor(Math.random() * words.length)];
      updateNodeData(id, { value: randomNoun });
    }
  }, [loading, error, words, data.value, id, updateNodeData]);

  const regenerate = () => {
    if (words.length > 0) {
      const randomNoun = words[Math.floor(Math.random() * words.length)];
      updateNodeData(id, { value: randomNoun });
    }
  };

  return (
    <NodeContainer id={id} selected={selected} title="Random Noun" isDarkMode={data.isDarkMode}>
      <div className="node-description">
        Generates a random noun
      </div>

      {loading && (
        <div style={{
          fontSize: '11px',
          color: data.isDarkMode ? '#aaa' : '#666',
          fontStyle: 'italic'
        }}>
          Loading words...
        </div>
      )}

      {error && (
        <div style={{
          fontSize: '11px',
          color: '#d44',
          fontStyle: 'italic'
        }}>
          {error}
        </div>
      )}

      {!loading && !error && (
        <button
          className="nodrag"
          onClick={regenerate}
          style={{
            padding: '6px 12px',
            fontSize: '12px',
            cursor: 'pointer',
            border: data.isDarkMode ? '1px solid #555' : '1px solid #ccc',
            borderRadius: '3px',
            background: data.isDarkMode ? '#3a3a3a' : 'white',
            color: data.isDarkMode ? '#e0e0e0' : '#000',
            width: '100%'
          }}
        >
          Generate New
        </button>
      )}

      <Handle type="source" position={Position.Right} />
    </NodeContainer>
  );
}
