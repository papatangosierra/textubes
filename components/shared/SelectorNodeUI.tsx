import { Position } from '@xyflow/react';
import NodeContainer from '../NodeContainer';
import HelpLabel from '../HelpLabel';
import type { NodeHelp } from '../../nodeRegistry';

export type SelectorOption = {
  key: string;
  label: string;
  value: string;
};

type SelectorNodeUIProps = {
  id: string;
  selected_state?: boolean;
  title: string;
  description?: string;
  options: SelectorOption[];
  selected: string;
  onSelectionChange: (key: string) => void;
  isDarkMode?: boolean;
  category?: 'source' | 'transformer' | 'destination';
  helpInfo?: NodeHelp;
  helpActive?: boolean;
  onHelpToggle?: () => void;
};

export default function SelectorNodeUI({
  id,
  selected_state,
  title,
  description,
  options,
  selected,
  onSelectionChange,
  isDarkMode,
  category,
  helpInfo,
  helpActive,
  onHelpToggle,
}: SelectorNodeUIProps) {
  return (
    <div className={`node-help-wrapper ${helpActive ? 'help-active' : ''}`}>
      {helpActive && helpInfo && (
        <div className="node-help-frame">
          <div
            className="help-description"
            dangerouslySetInnerHTML={{ __html: helpInfo.description }}
          />
        </div>
      )}

      <NodeContainer
        id={id}
        selected={selected_state}
        title={title}
        style={{ minWidth: '180px' }}
        isDarkMode={isDarkMode}
        category={category}
        onHelpToggle={onHelpToggle}
        helpActive={helpActive}
      >
        {description && (
          <div className="node-description">
            {description}
          </div>
        )}
        <div className="node-field">
          <label className="node-label">
            Select:
          </label>
          <select
            className="nodrag node-input"
            value={selected}
            onChange={(e) => onSelectionChange(e.target.value)}
          >
            {options.map((opt) => (
              <option key={opt.key} value={opt.key}>{opt.label}</option>
            ))}
          </select>
        </div>

        <HelpLabel
          type="source"
          position={Position.Right}
          helpActive={helpActive}
          helpLabel={helpInfo?.outputs?.[0]?.label}
          helpDescription={helpInfo?.outputs?.[0]?.description}
        />
      </NodeContainer>
    </div>
  );
}
