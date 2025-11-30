import SourceNode from "./components/SourceNode";
import ResultNode from "./components/ResultNode";
import CapslockNode from "./components/CapslockNode";
import ReplaceNode from "./components/ReplaceNode";
import RandomNode from "./components/RandomNode";
import RandomNounNode from "./components/RandomNounNode";
import UnicodeStyleNode from "./components/UnicodeStyleNode";
import ConcatenateNode from "./components/ConcatenateNode";
import ReverseNode from "./components/ReverseNode";
import TrimPadNode from "./components/TrimPadNode";
import RepeatNode from "./components/RepeatNode";
import CopypastaNode from "./components/CopypastaNode";
import RandomSelectionNode from "./components/RandomSelectionNode";
import BoxNode from "./components/BoxNode";
import HelpNode from "./components/HelpNode";
import TemplateNode from "./components/TemplateNode";
import { HELP_TEXT } from "./components/HelpNode";
import type { NodeData } from "./App";

export type NodeHelp = {
  description: string;
  inputs?: Array<{ label: string; description: string }>;
  outputs?: Array<{ label: string; description: string }>;
};

export type NodeConfig = {
  component: React.ComponentType<any>;
  label: string;
  /** Function to generate initial data for the node */
  initialData?: () => Record<string, any>;
  /** Category for organizing nodes in the picker */
  category: 'source' | 'transformer' | 'destination';
  /** Help documentation for the node */
  help?: NodeHelp;
};

export const NODE_REGISTRY: Record<string, NodeConfig> = {
  source: {
    component: SourceNode,
    label: "Text",
    category: 'source',
    help: {
      description: "A text input node where you can manually type or paste text.",
      outputs: [
        { label: "Output", description: "The text you entered" }
      ]
    }
  },
  copypasta: {
    component: CopypastaNode,
    label: "Copypasta",
    category: 'source',
    initialData: () => {
      const defaultPasta = `Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.`;
      return { value: defaultPasta, selected: 'lorem' };
    },
    help: {
      description: "Choose from a collection of classic copypastas and sample text.",
      outputs: [
        { label: "Output", description: "The selected copypasta text" }
      ]
    }
  },
  random: {
    component: RandomNode,
    label: "Random Alphanumeric Text",
    category: 'source',
    initialData: () => {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      let randomString = '';
      const length = 10;
      for (let i = 0; i < length; i++) {
        randomString += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return { value: randomString, length };
    },
    help: {
      description: "Generates random alphanumeric text of a specified length.",
      outputs: [
        { label: "Output", description: "Random string of letters and numbers" }
      ]
    }
  },
  randomnoun: {
    component: RandomNounNode,
    label: "Random Noun",
    category: 'source',
    // Value will be generated after word list loads
    initialData: () => ({ value: "" }),
    help: {
      description: "Generates a random noun from a curated word list.",
      outputs: [
        { label: "Output", description: "A randomly selected noun" }
      ]
    }
  },
  help: {
    component: HelpNode,
    label: "Help",
    category: 'source',
    initialData: () => ({
      value: HELP_TEXT
    }),
  },
  capslock: {
    component: CapslockNode,
    label: "Capslock",
    category: 'transformer',
    help: {
      description: "Converts all input text to uppercase letters.",
      inputs: [
        { label: "Input", description: "Text to convert to uppercase" }
      ],
      outputs: [
        { label: "Output", description: "Text converted to ALL CAPS" }
      ]
    }
  },
  unicode: {
    component: UnicodeStyleNode,
    label: "Unicode Abuse",
    category: 'transformer',
    help: {
      description: "Applies Unicode text styles like bold, italic, circled, and more using special Unicode characters.",
      inputs: [
        { label: "Input", description: "Text to transform" }
      ],
      outputs: [
        { label: "Output", description: "Text in the selected Unicode style" }
      ]
    }
  },
  replace: {
    component: ReplaceNode,
    label: "Replace",
    category: 'transformer',
    help: {
      description: "Finds all occurrences of a search pattern and replaces them with new text.",
      inputs: [
        { label: "Text", description: "Text to search within" },
        { label: "Search", description: "Pattern to find" },
        { label: "Replace", description: "Replacement text" }
      ],
      outputs: [
        { label: "Output", description: "Text with replacements applied" }
      ]
    }
  },
  concatenate: {
    component: ConcatenateNode,
    label: "Join",
    category: 'transformer',
    help: {
      description: "Joins multiple text inputs together in order, with an optional separator between them. Automatically creates new empty inputs as necessary.",
      inputs: [
        { label: "Input", description: "Text to join (add more by connecting)" }
      ],
      outputs: [
        { label: "Output", description: "All inputs joined together" }
      ]
    }
  },
  randomselection: {
    component: RandomSelectionNode,
    label: "Random Selection",
    category: 'transformer',
    initialData: () => ({ value: "", mode: "word" }),
    help: {
      description: "Randomly selects a character, word, or line from the input text.",
      inputs: [
        { label: "Input", description: "Text to select from" }
      ],
      outputs: [
        { label: "Output", description: "Randomly selected item" }
      ]
    }
  },
  reverse: {
    component: ReverseNode,
    label: "Reverse",
    category: 'transformer',
    help: {
      description: "Reverses the order of characters in the input text.",
      inputs: [
        { label: "Input", description: "Text to reverse" }
      ],
      outputs: [
        { label: "Output", description: "Text with characters in reverse order" }
      ]
    }
  },
  trimpad: {
    component: TrimPadNode,
    label: "Trim/Pad",
    category: 'transformer',
    help: {
      description: "Trims whitespace from text or pads it to a specified length.",
      inputs: [
        { label: "Input", description: "Text to trim or pad" }
      ],
      outputs: [
        { label: "Output", description: "Trimmed or padded text" }
      ]
    }
  },
  repeat: {
    component: RepeatNode,
    label: "Repeat",
    category: 'transformer',
    help: {
      description: "Repeats the input text a specified number of times with an optional separator.",
      inputs: [
        { label: "Input", description: "Text to repeat" }
      ],
      outputs: [
        { label: "Output", description: "Repeated text" }
      ]
    }
  },
  box: {
    component: BoxNode,
    label: "Box",
    category: 'transformer',
    help: {
      description: "Surrounds text with box-drawing characters in various styles.",
      inputs: [
        { label: "Input", description: "Text to enclose in a box" }
      ],
      outputs: [
        { label: "Output", description: "Text surrounded by box characters" }
      ]
    }
  },
  template: {
    component: TemplateNode,
    label: "Template",
    category: 'transformer',
    help: {
      description: "Parses text found in the first input, and creates more inputs for any text found between pairs of two underscores, e.g. <code>__greeting__</code> or <code>__first name__</code>.",
      inputs: [
        { label: "Template", description: "Text with __TOKEN__ placeholders" }
      ],
      outputs: [
        { label: "Output", description: "Template with tokens replaced" }
      ]
    }
  },
  result: {
    component: ResultNode,
    label: "Result",
    category: 'destination',
    help: {
      description: "Displays the final output text and provides a button to copy it to your clipboard. When random text generators are present in the flow, the Regenerate button refreshes their outputs.",
      inputs: [
        { label: "Input", description: "Text to display and copy" }
      ]
    }
  },
};

/** Get React Flow nodeTypes object from registry */
export function getNodeTypes() {
  return Object.fromEntries(
    Object.entries(NODE_REGISTRY).map(([key, config]) => [key, config.component])
  );
}

/** Get initial data for a node type */
export function getInitialNodeData(nodeType: string): NodeData {
  const config = NODE_REGISTRY[nodeType];
  if (config?.initialData) {
    return config.initialData() as NodeData;
  }
  return { value: "" };
}

/** Get category for a node type */
export function getNodeCategory(nodeType: string): 'source' | 'transformer' | 'destination' | undefined {
  return NODE_REGISTRY[nodeType]?.category;
}

/** Get help documentation for a node type */
export function getNodeHelp(nodeType: string): NodeHelp | undefined {
  return NODE_REGISTRY[nodeType]?.help;
}
