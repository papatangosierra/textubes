import { Handle, Position } from '@xyflow/react';
import type { HandleProps } from '@xyflow/react';

interface HelpLabelProps extends HandleProps {
  helpActive?: boolean;
  helpLabel?: string;
  helpDescription?: string;
}

export default function HelpLabel({
  helpActive,
  helpLabel,
  helpDescription,
  type,
  position,
  style,
  ...handleProps
}: HelpLabelProps) {
  const showHelp = helpActive && helpLabel;
  const isInput = type === 'target';
  const isOutput = type === 'source';

  return (
    <>
      {showHelp && isInput && (
        <div className="handle-help-label handle-help-left" style={style && style.top ? {top: ((parseFloat(style.top.toString()) * 1) + .9) + 'rem'} : style}>
          <div className="help-label-title">{helpLabel}</div>
          {helpDescription && <div className="help-label-desc">{helpDescription}</div>}
        </div>
      )}
      <Handle type={type} position={position} style={style} {...handleProps} />
      {showHelp && isOutput && (
        <div className="handle-help-label handle-help-right" style={{top: '50%'}}>
          <div className="help-label-title">{helpLabel}</div>
          {helpDescription && <div className="help-label-desc">{helpDescription}</div>}
        </div>
      )}
    </>
  );
}
