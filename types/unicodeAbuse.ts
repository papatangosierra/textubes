export function translateString(s: string) {
  let i = 0;
  const res = {
    fullPitch: '',
    circled: '',
    parens: '',
    bold: '',
    ital: '',
    boldital: '',
    boldsans: '',
    italsans: '',
    bolditalsans: '',
    script: '',
    boldscript: '',
    fraktur: '',
    doublestruck: '',
    monospace: '',
    negcircle: '',
    negbox: '',
    box: '',
    dotbox: '',
    superscript: '',
    subscript: '',
  };

  const punctuation = "`,#$%&@()[]{}~*+-./\\:;<=>?!@^_'\" ";
  const translationObj: Record<string, Record<string, string>> = {
    " ": {
      fullPitch: String.fromCodePoint(0x3000)
    },
    "`": {
      fullPitch: String.fromCodePoint(0xff40)
    },
    "'": {
      fullPitch: String.fromCodePoint(0xff07)
    },
    '"': {
      fullPitch: String.fromCodePoint(0xff02)
    },
    "#": {
      fullPitch: String.fromCodePoint(0xff03)
    },
    "$": {
      fullPitch: String.fromCodePoint(0xff04)
    },
    "%": {
      fullPitch: String.fromCodePoint(0xff05)
    },
    "&": {
      fullPitch: String.fromCodePoint(0xff06)
    },
    "@": {
      fullPitch: String.fromCodePoint(0xff20)
    },
    "(": {
      fullPitch: String.fromCodePoint(0xff08)
    },
    ")": {
      fullPitch: String.fromCodePoint(0xff09)
    },
    "[": {
      fullPitch: String.fromCodePoint(0xff3b)
    },
    "]": {
      fullPitch: String.fromCodePoint(0xff3d)
    },
    "{": {
      fullPitch: String.fromCodePoint(0xff5b)
    },
    "}": {
      fullPitch: String.fromCodePoint(0xff5d)
    },
    "~": {
      fullPitch: String.fromCodePoint(0xff5e)
    },
    "*": {
      fullPitch: String.fromCodePoint(0xff0a)
    },
    "+": {
      fullPitch: String.fromCodePoint(0xff0b)
    },
    ",": {
      fullPitch: String.fromCodePoint(0xff0c)
    },
    "-": {
      fullPitch: String.fromCodePoint(0xff0d)
    },
    ".": {
      fullPitch: String.fromCodePoint(0xff0e)
    },
    "/": {
      fullPitch: String.fromCodePoint(0xff0f)
    },
    '\\': {
      fullPitch: String.fromCodePoint(0xff3c)
    },
    ":": {
      fullPitch: String.fromCodePoint(0xff1a)
    },
    ";": {
      fullPitch: String.fromCodePoint(0xff1b)
    },
    "<": {
      fullPitch: String.fromCodePoint(0xff1c)
    },
    "=": {
      fullPitch: String.fromCodePoint(0xff1d)
    },
    ">": {
      fullPitch: String.fromCodePoint(0xff1e)
    },
    "?": {
      fullPitch: String.fromCodePoint(0xff1f)
    },
    "!": {
      fullPitch: String.fromCodePoint(0xff01)
    },
    "^": {
      fullPitch: String.fromCodePoint(0xff3e)
    },
    "_": {
      fullPitch: String.fromCodePoint(0xff3f)
    }
  };

  // add number translations
  const superscriptNums = [0x2070, 0x00b9, 0x00b2, 0x00b3, 0x2074, 0x2075, 0x2076, 0x2077, 0x2078, 0x2079];
  for (let j = 0; j < 10; j++) {
    translationObj[String.fromCodePoint(0x0030 + j)] = {
      fullPitch: String.fromCodePoint(0xff10 + j),
      circled: String.fromCodePoint(0x24ea + j),
      parens: String.fromCodePoint(0x2474 + j),
      bold: String.fromCodePoint(0x1d7ce + j),
      ital: String.fromCodePoint(0x0030 + j),
      boldital: String.fromCodePoint(0x1d7ce + j),
      italsans: String.fromCodePoint(0x0030 + j),
      boldsans: String.fromCodePoint(0x1d7ec + j),
      bolditalsans: String.fromCodePoint(0x1d7ec + j),
      script: String.fromCodePoint(0x0030 + j),
      boldscript: String.fromCodePoint(0x0030 + j),
      fraktur: String.fromCodePoint(0x0030 + j),
      doublestruck: String.fromCodePoint(0x1d7d8 + j),
      monospace: String.fromCodePoint(0x1d7f6 + j),
      negcircle: String.fromCodePoint(0x24ff + j),
      negbox: String.fromCodePoint(0xff10 + j),
      box: String.fromCodePoint(0xff10 + j),
      dotbox: String.fromCodePoint(0xff10 + j),
      superscript: String.fromCodePoint(superscriptNums[j]),
      subscript: String.fromCodePoint(0x2080 + j),
    };
  }

  // add alphabet translations
  // Superscript lowercase: a b c d e f g h i j k l m n o p q r s t u v w x y z
  const superscriptLower = [0x1d43, 0x1d47, 0x1d9c, 0x1d48, 0x1d49, 0x1da0, 0x1d4d, 0x02b0, 0x2071, 0x02b2, 0x1d4f, 0x02e1, 0x1d50, 0x207f, 0x1d52, 0x1d56, 0x0071, 0x02b3, 0x02e2, 0x1d57, 0x1d58, 0x1d5b, 0x02b7, 0x02e3, 0x02b8, 0x1dbb];
  // Superscript uppercase: A B C D E F G H I J K L M N O P Q R S T U V W X Y Z
  const superscriptUpper = [0x1d2c, 0x1d2e, 0x0043, 0x1d30, 0x1d31, 0x0046, 0x1d33, 0x1d34, 0x1d35, 0x1d36, 0x1d37, 0x1d38, 0x1d39, 0x1d3a, 0x1d3c, 0x1d3e, 0x0051, 0x1d3f, 0x0053, 0x1d40, 0x1d41, 0x2c7d, 0x1d42, 0x0058, 0x0059, 0x005a];
  // Subscript lowercase: a e h i k l m n o p r s t u x (others fallback to normal)
  const subscriptLowerMap: Record<number, number> = { 0: 0x2090, 4: 0x2091, 7: 0x2095, 10: 0x2096, 11: 0x2097, 12: 0x2098, 13: 0x2099, 14: 0x2092, 15: 0x209a, 17: 0x1d63, 18: 0x209b, 19: 0x209c, 23: 0x2093 };

  for (let j = 0; j < 26; j++) {
    const upperChar = String.fromCodePoint(0x0041 + j);
    const lowerChar = String.fromCodePoint(0x0061 + j);

    translationObj[upperChar] = {
      fullPitch: String.fromCodePoint(0xff21 + j),
      circled: String.fromCodePoint(0x24b6 + j),
      parens: String.fromCodePoint(0x1f110 + j),
      bold: String.fromCodePoint(0x1d400 + j),
      ital: String.fromCodePoint(0x1d434 + j),
      boldital: String.fromCodePoint(0x1d468 + j),
      boldsans: String.fromCodePoint(0x1d5d4 + j),
      italsans: String.fromCodePoint(0x1d608 + j),
      bolditalsans: String.fromCodePoint(0x1d63c + j),
      script: String.fromCodePoint(0x1d49c + j),
      boldscript: String.fromCodePoint(0x1d4d0 + j),
      fraktur: String.fromCodePoint(0x1d504 + j),
      doublestruck: String.fromCodePoint(0x1d538 + j),
      monospace: String.fromCodePoint(0x1d670 + j),
      negcircle: String.fromCodePoint(0x1f150 + j),
      negbox: String.fromCodePoint(0x1f170 + j),
      box: String.fromCodePoint(0x1f130 + j),
      dotbox: String.fromCodePoint(0x1f1e6 + j) + String.fromCodePoint(0x200c), // add zero-width non-joiner character to prevent these guys from turning into flags!!!
      superscript: String.fromCodePoint(superscriptUpper[j]),
      subscript: upperChar, // No subscript uppercase
    };
    translationObj[lowerChar] = {
      fullPitch: String.fromCodePoint(0xff41 + j),
      circled: String.fromCodePoint(0x24d0 + j),
      parens: String.fromCodePoint(0x249c + j),
      bold: String.fromCodePoint(0x1d41a + j),
      ital: String.fromCodePoint(0x1d44e + j),
      boldital: String.fromCodePoint(0x1d482 + j),
      boldsans: String.fromCodePoint(0x1d5ee + j),
      italsans: String.fromCodePoint(0x1d622 + j),
      bolditalsans: String.fromCodePoint(0x1d656 + j),
      script: String.fromCodePoint(0x1d4b6 + j),
      boldscript: String.fromCodePoint(0x1d4ea + j),
      fraktur: String.fromCodePoint(0x1d51e + j),
      doublestruck: String.fromCodePoint(0x1d552 + j),
      monospace: String.fromCodePoint(0x1d68a + j),
      // these are just duplicates of the uppercase entries since there are no lowercase variants of these chars
      negcircle: String.fromCodePoint(0x1f150 + j),
      negbox: String.fromCodePoint(0x1f170 + j),
      box: String.fromCodePoint(0x1f130 + j),
      dotbox: String.fromCodePoint(0x1f1e6 + j) + String.fromCodePoint(0x200c), // add zero-width non-joiner character to prevent these guys from turning into flags!!!
      superscript: String.fromCodePoint(superscriptLower[j]),
      subscript: subscriptLowerMap[j] ? String.fromCodePoint(subscriptLowerMap[j]) : lowerChar,
    };
  }

  // add exceptions for non-sequential codepoints here
  translationObj['h']!.ital = String.fromCodePoint(0x210e);
  translationObj['e']!.script = String.fromCodePoint(0x212f);
  translationObj['g']!.script = String.fromCodePoint(0x210a);
  translationObj['o']!.script = String.fromCodePoint(0x2134);
  translationObj['B']!.script = String.fromCodePoint(0x212c);
  translationObj['E']!.script = String.fromCodePoint(0x2130);
  translationObj['F']!.script = String.fromCodePoint(0x2131);
  translationObj['H']!.script = String.fromCodePoint(0x210b);
  translationObj['I']!.script = String.fromCodePoint(0x2110);
  translationObj['L']!.script = String.fromCodePoint(0x2112);
  translationObj['M']!.script = String.fromCodePoint(0x2133);
  translationObj['R']!.script = String.fromCodePoint(0x211b);
  translationObj['C']!.fraktur = String.fromCodePoint(0x212d);
  translationObj['H']!.fraktur = String.fromCodePoint(0x210c);
  translationObj['I']!.fraktur = String.fromCodePoint(0x2111);
  translationObj['R']!.fraktur = String.fromCodePoint(0x211c);
  translationObj['Z']!.fraktur = String.fromCodePoint(0x2128);
  translationObj['C']!.doublestruck = String.fromCodePoint(0x2102);
  translationObj['H']!.doublestruck = String.fromCodePoint(0x210d);
  translationObj['N']!.doublestruck = String.fromCodePoint(0x2115);
  translationObj['P']!.doublestruck = String.fromCodePoint(0x2119);
  translationObj['Q']!.doublestruck = String.fromCodePoint(0x211a);
  translationObj['R']!.doublestruck = String.fromCodePoint(0x211d);
  translationObj['Z']!.doublestruck = String.fromCodePoint(0x2124);

  translationObj['1']!.negcircle = String.fromCodePoint(0x2776);
  translationObj['2']!.negcircle = String.fromCodePoint(0x2777);
  translationObj['3']!.negcircle = String.fromCodePoint(0x2778);
  translationObj['4']!.negcircle = String.fromCodePoint(0x2779);
  translationObj['5']!.negcircle = String.fromCodePoint(0x277a);
  translationObj['6']!.negcircle = String.fromCodePoint(0x277b);
  translationObj['7']!.negcircle = String.fromCodePoint(0x277c);
  translationObj['8']!.negcircle = String.fromCodePoint(0x277d);
  translationObj['9']!.negcircle = String.fromCodePoint(0x277e);

  translationObj['1']!.circled = String.fromCodePoint(0x2460);
  translationObj['2']!.circled = String.fromCodePoint(0x2461);
  translationObj['3']!.circled = String.fromCodePoint(0x2462);
  translationObj['4']!.circled = String.fromCodePoint(0x2463);
  translationObj['5']!.circled = String.fromCodePoint(0x2464);
  translationObj['6']!.circled = String.fromCodePoint(0x2465);
  translationObj['7']!.circled = String.fromCodePoint(0x2466);
  translationObj['8']!.circled = String.fromCodePoint(0x2467);
  translationObj['9']!.circled = String.fromCodePoint(0x2468);

  while (i < s.length) {
    const char = s.charAt(i);

    if (punctuation.includes(char)) {
      // if it's in the punctuation string
      // use full-width punctuation for some variants
      const fullPitchChar = translationObj[char]?.fullPitch || char;
      res.fullPitch += fullPitchChar;
      res.circled += fullPitchChar;
      res.parens += fullPitchChar;
      res.negcircle += fullPitchChar;
      res.negbox += fullPitchChar;
      res.box += fullPitchChar;
      res.dotbox += fullPitchChar;
      // and regular punctuation for everything else
      res.bold += char;
      res.ital += char;
      res.boldital += char;
      res.boldsans += char;
      res.italsans += char;
      res.bolditalsans += char;
      res.script += char;
      res.boldscript += char;
      res.fraktur += char;
      res.doublestruck += char;
      res.monospace += char;
      res.superscript += char;
      res.subscript += char;
      i++;
      continue;
    }

    const translation = translationObj[char];
    if (translation) {
      res.fullPitch += translation.fullPitch || char;
      res.circled += translation.circled || char;
      res.parens += translation.parens || char;
      res.bold += translation.bold || char;
      res.ital += translation.ital || char;
      res.boldital += translation.boldital || char;
      res.boldsans += translation.boldsans || char;
      res.italsans += translation.italsans || char;
      res.bolditalsans += translation.bolditalsans || char;
      res.script += translation.script || char;
      res.boldscript += translation.boldscript || char;
      res.fraktur += translation.fraktur || char;
      res.doublestruck += translation.doublestruck || char;
      res.monospace += translation.monospace || char;
      res.negcircle += translation.negcircle || char;
      res.negbox += translation.negbox || char;
      res.box += translation.box || char;
      res.dotbox += translation.dotbox || char;
      res.superscript += translation.superscript || char;
      res.subscript += translation.subscript || char;
    } else {
      // Character not in translation table, keep as-is
      res.fullPitch += char;
      res.circled += char;
      res.parens += char;
      res.bold += char;
      res.ital += char;
      res.boldital += char;
      res.boldsans += char;
      res.italsans += char;
      res.bolditalsans += char;
      res.script += char;
      res.boldscript += char;
      res.fraktur += char;
      res.doublestruck += char;
      res.monospace += char;
      res.negcircle += char;
      res.negbox += char;
      res.box += char;
      res.dotbox += char;
      res.superscript += char;
      res.subscript += char;
    }
    i++;
  }

  return res;
}
