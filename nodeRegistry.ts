import SourceNode from "./components/SourceNode";
import ResultNode from "./components/ResultNode";
import CapslockNode from "./components/CapslockNode";
import ReplaceNode from "./components/ReplaceNode";
import RandomNode from "./components/RandomNode";
import RandomNounNode from "./components/RandomNounNode";
import RandomAdjectiveNode from "./components/RandomAdjectiveNode";
import UnicodeStyleNode from "./components/UnicodeStyleNode";
import ConcatenateNode from "./components/ConcatenateNode";
import SplitNode from "./components/SplitNode";
import ReverseNode from "./components/ReverseNode";
import TrimPadNode from "./components/TrimPadNode";
import WrapTextNode from "./components/WrapTextNode";
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
  randomadjective: {
    component: RandomAdjectiveNode,
    label: "Random Adjective",
    category: 'source',
    // Value will be generated after word list loads
    initialData: () => ({ value: "" }),
    help: {
      description: "Generates a random adjective from a curated word list.",
      outputs: [
        { label: "Output", description: "A randomly selected adjective" }
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
    label: "Change Case",
    category: 'transformer',
    initialData: () => ({ value: "", mode: "upper" }),
    help: {
      description: "Transforms text case. Choose from UPPERCASE, lowercase, Capitalized (each word), or aLtErNaTiNg (character by character).",
      inputs: [
        { label: "Input", description: "Text to transform" }
      ],
      outputs: [
        { label: "Output", description: "Text in the selected case style" }
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
  split: {
    component: SplitNode,
    label: "Split",
    category: 'transformer',
    initialData: () => ({ mode: "line", delimiter: ",", parts: [] }),
    help: {
      description: "Splits text into multiple parts by line, delimiter, or character. Each part gets its own output handle that can be connected separately.",
      inputs: [
        { label: "Input", description: "Text to split" }
      ],
      outputs: [
        { label: "Outputs", description: "Each split part (connect to individual handles)" }
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
  wraptext: {
    component: WrapTextNode,
    label: "Wrap Text",
    category: 'transformer',
    initialData: () => ({ value: "", length: 80, alignment: "left" }),
    help: {
      description: "Hard-wraps text at the specified column width with optional alignment. Choose Left for standard wrapping, Full for justified text, or Right/Center for aligned text.",
      inputs: [
        { label: "Input", description: "Text to wrap and align" }
      ],
      outputs: [
        { label: "Output", description: "Text wrapped and aligned at specified width" }
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
    initialData: () => ({ value: "", style: "simple", horizontalPadding: 1, verticalPadding: 0 }),
    help: {
      description: "Surrounds text with box-drawing characters in various styles. Horizontal padding adds spaces left and right of text. Vertical padding adds empty lines above and below text.",
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
