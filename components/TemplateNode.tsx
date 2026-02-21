import { Position, useNodesData, useReactFlow, type NodeProps, type Node, useNodeConnections } from '@xyflow/react';
import { useEffect } from 'react';
import type { NodeData } from '../App';
import NodeContainer from './NodeContainer';
import HelpLabel from './HelpLabel';
import { getNodeCategory, getNodeHelp } from '../nodeRegistry';

type TemplateNodeData = NodeData & {
  template?: string;
};

export default function TemplateNode({ id, data, selected, type }: NodeProps<Node<TemplateNodeData>>) {
  const { updateNodeData } = useReactFlow();
  const helpInfo = getNodeHelp(type);
  const allConnections = useNodeConnections({ handleType: 'target' });

  const toggleHelp = () => {
    updateNodeData(id, { helpActive: !data.helpActive });
  };

  // Get the template input connection (special handle 'template')
  const templateConnection = useNodeConnections({ handleType: 'target', handleId: 'template' });
  const templateSourceId = templateConnection.length > 0 ? templateConnection[0]?.source : undefined;
  const templateNodeData = useNodesData(templateSourceId ? [templateSourceId] : []);
  const template = templateSourceId
    ? ((templateNodeData[0]?.data as NodeData | undefined)?.value ?? '')
    : '';

  // Parse template for __TOKEN__ patterns (lazy \w+? allows underscores inside tokens)
  const regex = /__(\w+?)__/g;
  const matches = [...template.matchAll(regex)];

  // Build list of unique tokens and their handle IDs
  const tokens: Array<{ token: string; handleId: string }> = [];
  const seenTokens = new Set<string>();

  matches.forEach((match) => {
    const token = match[1];
    if (!seenTokens.has(token)) {
      seenTokens.add(token);
      tokens.push({
        token,
        handleId: `token-${token}`
      });
    }
  });

  // Get connections by handle ID (excluding the template handle)
  const handleConnections = new Map<string, string>();
  allConnections.forEach(conn => {
    const handleId = conn.targetHandle;
    if (handleId && handleId !== 'template') {
      handleConnections.set(handleId, conn.source);
    }
  });

  // Get source IDs for all connected handles
  const sourceIds = tokens
    .map(t => handleConnections.get(t.handleId))
    .filter((id): id is string => id !== undefined);

  const nodesData = useNodesData(sourceIds);

  // Build map of token -> replacement value
  const tokenValues = new Map<string, string>();
  tokens.forEach((t, i) => {
    const sourceId = handleConnections.get(t.handleId);
    if (sourceId) {
      const nodeIndex = sourceIds.indexOf(sourceId);
      if (nodeIndex >= 0) {
        const nodeValue = (nodesData[nodeIndex]?.data as NodeData | undefined)?.value ?? '';
        tokenValues.set(t.token, nodeValue);
      }
    }
  });

  // Serialize token values for dependency tracking
  const tokenValuesString = Array.from(tokenValues.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}:${v}`)
    .join('|||');

  useEffect(() => {
    // If no template input, output empty
    if (!templateSourceId) {
      if (data.value !== '') {
        updateNodeData(id, { value: '' });
      }
      return;
    }

    // Replace all __TOKEN__ with their values
    let output = template;

    // Sort matches by position (descending) to avoid offset issues
    const sortedMatches = [...matches].sort((a, b) => (b.index ?? 0) - (a.index ?? 0));

    sortedMatches.forEach((match) => {
      const token = match[1];
      const replacement = tokenValues.get(token) ?? `__${token}__`;
      const startPos = match.index ?? 0;
      const endPos = startPos + match[0].length;

      output = output.slice(0, startPos) + replacement + output.slice(endPos);
    });

    if (data.value !== output) {
      updateNodeData(id, { value: output });
    }
  }, [template, tokenValuesString, templateSourceId, id, updateNodeData, data.value]);

  // set these assuming rem units!!
  const HANDLE_START = 3.5;
  const HANDLE_SPACING = 1.5;

  // Calculate minimum height based on number of handles (including template handle)
  const totalHandles = tokens.length + 1; // +1 for template handle
  const minHeight = (HANDLE_START + (totalHandles - 1) * HANDLE_SPACING + 1);

  return (
    <div className={`node-help-wrapper ${data.helpActive ? 'help-active' : ''}`}>
      {data.helpActive && helpInfo && (
        <div className="node-help-frame">
          {/* Description at the bottom */}
          <div
            className="help-description"
            dangerouslySetInnerHTML={{ __html: helpInfo.description }}
          />
        </div>
      )}

      <NodeContainer
        id={id}
        selected={selected}
        title="Template"
        style={{ minWidth: '200px', minHeight: `${minHeight}rem` }}
        isDarkMode={data.isDarkMode}
        category={getNodeCategory(type)}
        onHelpToggle={toggleHelp}
        helpActive={data.helpActive}
      >
        <HelpLabel
          type="source"
          position={Position.Right}
          helpActive={data.helpActive}
          helpLabel={helpInfo?.outputs?.[0]?.label}
          helpDescription={helpInfo?.outputs?.[0]?.description}
        />

        <div className="node-description">
          Replace __TOKEN__ in main input with  <br />text from corresponding input
        </div>


        {/* Template input handle (always first) */}
        <HelpLabel
          type="target"
          position={Position.Left}
          id="template"
          style={{
            top: `${HANDLE_START}rem`,
            background: templateSourceId ? '#555' : '#999',
          }}
          helpActive={data.helpActive}
          helpLabel={helpInfo?.inputs?.[0]?.label}
          helpDescription={helpInfo?.inputs?.[0]?.description}
        />

        {/* Render dynamic handles for each unique token (offset by 1 for template handle) */}
        {tokens.map((t, i) => {
          const isConnected = handleConnections.has(t.handleId);

          return (
            <div
              key={t.handleId}
              className="template-token-handle"
              style={{
                top: `${HANDLE_START + (i + 1) * HANDLE_SPACING}rem`,
              }}
            >
              <HelpLabel
                type="target"
                position={Position.Left}
                id={t.handleId}
                style={{
                  position: 'relative',
                  left: '0',
                  top: '0',
                  transform: 'none',
                  background: isConnected ? '#555' : '#999',
                }}
                helpActive={false}
                helpLabel=""
                helpDescription=""
              />
              <span className="template-token-label">
                {t.token}
              </span>
            </div>
          );
        })}
      </NodeContainer>
    </div>
  );
}
