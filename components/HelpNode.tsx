import { Handle, Position, type NodeProps, type Node } from '@xyflow/react';
import type { NodeData } from '../App';
import NodeContainer from './NodeContainer';
import { getNodeCategory } from '../nodeRegistry';

const HELP_TEXT = `Welcome to Textubes!

(Textubes does not currently work very well on smartphones.)

In Textubes, you connect boxes to each other to make text into different text. Clicking and dragging on the background moves around. Use mousewheel or trackpad scrolling to zoom in and out. 

There are three kinds of boxes:

- Text Sources
- Text Transformers
- Text Destinations

Text STARTS in Sources, goes THROUGH Transformers, and FINISHES in Destinations.

The dots on the left side of a box are its inputs, and the dot on the right side is its output. You can click and drag on an output to connect it to an input (or vice versa).

An output can connect to multiple inputs, but an input can only connect to one output.

You can delete a node by clicking on it and pressing "delete", or by clicking the [x] button in the top left corner.

You can delete a connection by clicking on it and pressing "delete", or by dragging a different output to its input.

Textubes automatically saves the canvas in local browser storage as you work.
`;

export default function HelpNode({ id, data, selected, type }: NodeProps<Node<NodeData>>) {
  return (
    <NodeContainer id={id} selected={selected} title="Help" isDarkMode={data.isDarkMode} category={getNodeCategory(type)}>
      <div className="node-description">
        Outputs helpful information about Textubes
      </div>
      <Handle type="source" position={Position.Right} />
    </NodeContainer>
  );
}
