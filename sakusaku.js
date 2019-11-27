let CONSONANT_LIST = Object.keys(CONSONANT_TO_HIRAGANA);

let ACTIVATE_CONV_VOWEL = false;

let app = new Vue({
    el: '#app',
    data: {
        vowel: "",
        consonant: "",
        letters: [],
        decript: "",
        current_pos: 0,
        current_width: 1,
        word_list: [],
        selected_word: ""
    },
    watch: {
        current_width: function () {
            app.startLookup()
        }
    },
    methods: {
        onKeyInput: function (char) {
            if (VOWEL_LIST.includes(char)) {
                app.vowel = char
                app.put_letter()
            }
            if (CONSONANT_LIST.includes(char)) {
                if (app.consonant === "n" && char === "n") {
                    app.put_letter()
                    return
                }
                if (CONSONANT_LIST.includes(app.consonant + char)) {
                    app.consonant += char
                } else if (app.consonant === "n") {
                    app.put_letter()
                    app.consonant = char
                }
            }
        },
        put_letter: function () {
            if (app.consonant == "") {
                app.letters.push(conv_vowel(app.vowel))
            } else {
                app.letters.push(app.consonant)
            }
            app.consonant = ""
            app.vowel = ""
        },
        startLookup: function () {
            let sliced_letters = app.letters.slice(0, app.current_width)
            let sounds = sliced_letters.map(x => VOWEL_TO_HIRAGANA[x] || CONSONANT_TO_HIRAGANA[x])
            let katakana_results = sound_lookup(sounds)
            if (katakana_results === null) {
                app.word_list = []
                app.selected_word = ""
                return
            }
            app.word_list = [].concat(...katakana_results.map(x => dictionary_table[x]))
            if (app.selected_word === "") {
                app.selected_word = app.word_list[0]
            }
        },
        onArrowLeft: function () {
            if (app.current_width > 1) {
                app.current_width -= 1
            }
        },
        onArrowRight: function () {
            app.current_width += 1
        },
        onArrowTop: function () {
        },
        onArrowDown: function () {
        }
    }
});

let conv_vowel = (vw) => {
    if (ACTIVATE_CONV_VOWEL === true) {
        return CONV_VOWEL_TABLE[vw];
    } else {
        return vw;
    }
}

window.onkeydown = (ev) => {
    document.getElementById("phone_input").value = ""
    if (65 <= ev.keyCode && ev.keyCode <= 90) {
        let char = String.fromCharCode(ev.keyCode).toLowerCase();
        app.onKeyInput(char)
    }
    if (ev.code === "ArrowLeft") {
        app.onArrowLeft()
    }
    if (ev.code === "ArrowRight") {
        app.onArrowRight()
    }
    if (ev.code === "ArrowTop") {
        app.onArrowTop()
    }
    if (ev.code === "ArrowDown") {
        app.onArrowDown()
    }
}

document.getElementById("app").style.display = "block";
