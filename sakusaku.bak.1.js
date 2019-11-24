// Must be one character
let VOWEL_LIST = [
    "a",
    "i",
    "u",
    "e",
    "o"
];

let CONSONANT_TO_HIRAGANA = {
    "k":["か", "き", "く", "け", "こ"],
    "kk":[],
    "ky":["きゃ", "きぃ", "きゅ", "きぇ", "きょ"],
    "kh":["か", "き", "く", "け", "こ"],
    "kw":["くぁ", "くぃ", "くぅ", "くぇ", "くぉ"],

    "g":["が", "ぎ", "ぐ", "げ", "ご"],
    "gg":[],
    "gy":[ぎゃぎぃぎゅぎぇぎょ],
    "gh":[がぎぐげご],
    "gw":[ぐぁぐぃぐぅぐぇぐぉ],

    "s":["さ", "し", "す", "せ", "そ"],
    "ss":[],
    "sy":[しゃししぃしゅしぇしょ],
    "sh":[しゃししぃしゅしぇしょ],
    "sw":[すぁすぃすぅすぇすぉ],

    "z":["ざ", "じ", "ず", "ぜ", "ぞ"],
    "zz":[],
    "zy":[じゃじぃじゅじぇじょ],
    "zh":[ざじずぜぞ],
    "zw":[ずぁずぃずぅずぇずぉ],

    "t":["た", "ち", "つ", "て", "と"],
    "tt":[],
    "ty":[],
    "th":[],
    "tw":[],

    "c":["か", "き", "く", "け", "こ", "さ", "し", "す", "せ", "そ"],
    "cc":[],
    "cy":[],
    "ch":[],
    "cw":[],

    "d":["だ", "ぢ", "づ", "で", "ど", "ざ", "じ", "ず", "ぜ", "ぞ"],
    "dd":[],
    "dy":[],
    "dh":[],
    "dw":[],

    "n":["な", "に", "ぬ", "ね", "の"],
    "nn":[],
    "ny":[],
    "nh":[],
    "nw":[],

    "h":["は", "ひ", "ふ", "へ", "ほ"],
    "hh":[],
    "hy":[],
    "hw":[],

    "f":["ふぁ", "ふぃ", "ふ", "ふぅ", "ふぇ", "ふぉ"],
    "ff":[],
    "fy":[],
    "fh":[],
    "fw":[],

    "p":["ぱ", "ぴ", "ぷ", "ぺ", "ぽ"],
    "pp":[],
    "py":[],
    "ph":[],
    "pw":[],

    "b":["ば", "び", "ぶ", "べ", "ぼ"],
    "bb":[],
    "by":[],
    "bh":[],
    "bw":[],

    "v":["ゔぁ", "ゔぃ", "ゔぅ", "ゔ", "ゔぇ", "ゔぉ"],
    "vv":[],
    "vy":[],
    "vh":[],
    "vw":[],

    "m":["ま", "み", "む", "め", "も"],
    "mm":[],
    "my":[],
    "mh":[],
    "mw":[],

    "y":["や", "い", "いぃ", "ゆ", "え", "いぇ", "よ"],
    "yy":[],
    "yh":[],
    "yw":[],

    "r":["ら", "り", "る", "れ", "ろ"],
    "rr":[],
    "ry":[],
    "rh":[],
    "rw":[],

    "w":["わ", "うぃ", "い", "う", "うぇ", "え", "を", "お"],
    "ww":[],
    "wy":[],
    "wh":[],

    "j":["じゃ", "じ", "じぃ", "じゅ", "じぇ", "じょ"],
    "jj":[],
    "jy":[],
    "jh":[],
    "jw":[],

    "l":["ぁ", "ぃ", "ぅ", "ぇ", "ぉ", "ら", "り", "る", "れ", "ろ", "らぁ", "りぃ", "るぅ", "れぇ", "ろぉ"],
    "ll":[],
    "ly":[],
    "lh":[],
    "lw":[],
};

// Must follow following rule:
//   For all x y (where x and y are non-empty strings), x + y \in CONSONANT_LIST => x \in CONSONANT_LIST and y \in CONSONANT_LIST.
let CONSONANT_LIST = Object.keys(CONSONANT_TO_HIRAGANA);

let ACTIVATE_CONV_VOWEL = false;

let CONV_VOWEL_TABLE = {
    "a": "h",
    "i": "y",
    "u": "w",
    "e": "h",
    "o": "b"
}

let app = new Vue({
    el: '#app',
    data: {
        vowel: "",
        consonant: "",
        letters: [],
        decript: ""
    }
});

let conv_vowel = (vw) => {
    if (ACTIVATE_CONV_VOWEL === true) {
        return CONV_VOWEL_TABLE[vw];
    } else {
        return vw;
    }
}

let put_letter = () => {
    if (app.consonant == "") {
        app.letters.push(conv_vowel(app.vowel))
    } else {
        app.letters.push(app.consonant)
    }
    app.consonant = ""
    app.vowel = ""
}

window.onkeydown = (ev) => {
    console.log(ev)
    if (65 <= ev.keyCode && ev.keyCode <= 90) {
        let char = String.fromCharCode(ev.keyCode).toLowerCase();
        if (VOWEL_LIST.includes(char)) {
            app.vowel = char
            put_letter()
        }
        if (CONSONANT_LIST.includes(char)) {
            if (app.consonant == "n" && char == "n") {
                put_letter()
                return
            }
            if (CONSONANT_LIST.includes(app.consonant + char)) {
                app.consonant += char
            }
        }
    }
}

document.getElementById("app").style.display = "block";