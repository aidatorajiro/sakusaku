let CONV_VOWEL_TABLE = {
    "a": "h",
    "i": "y",
    "u": "w",
    "e": "h",
    "o": "b"
}

// Must be one character
let VOWEL_LIST = [
    "a",
    "i",
    "u",
    "e",
    "o"
];

let VOWEL_TO_HIRAGANA = {
    "a": ["ア", "アー"],
    "i": ["イ", "イー"],
    "u": ["ウ", "ウー"],
    "e": ["エ", "エー"],
    "o": ["オ", "オー"]
}

// consonants must follow following rule:
//   For all x y (where x and y are non-empty strings), x + y \in CONSONANT => x \in CONSONANT and y \in CONSONANT.
let CONSONANT_LIST = Object.keys(CONSONANT_TO_HIRAGANA);

// whether activate vowel to consonant conversion (Just like Hebrew)
let ACTIVATE_CONV_VOWEL = false;

// limit of letters lookup
let LIMIT_LOOKUP = 10;

// layout of word
let WORD_LAYOUT = "LATTICE"

// method of word choice with mouse
let WORD_CHOICE_METHOD = "DISTANCE"