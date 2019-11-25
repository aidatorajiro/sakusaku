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

// consonants must follow following rule:
//   For all x y (where x and y are non-empty strings), x + y \in CONSONANT => x \in CONSONANT and y \in CONSONANT.
// let CONSONANT_TO_HIRAGANA = { ... }
