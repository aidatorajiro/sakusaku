let app = new Vue({
    el: '#app',
    data: {
        vowel: "",
        consonant: "",
        letters: [],
        decrypt: "",
        current_pos: 0,
        current_width: 0,
        word_list: [],
        selected_word_index: 0,
        smartphone: false
    },
    watch: {
        current_width: function () {
            app.start_lookup()
        },
        current_pos: function () {
            app.start_lookup()
        },
        letters: function () {
            app.start_lookup()
        }
    },
    methods: {
        // Keyboard process functions
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
        onArrowUp: function () {
            if (app.selected_word_index !== 0) {
                app.selected_word_index -= 1
            }
        },
        onArrowDown: function () {
            if (app.selected_word_index + 1 !== app.word_list.length) {
                app.selected_word_index += 1
            }
        },
        onEnter: function () {
            app.addWord(app.selected_word_index)
        },

        // internal functions
        start_lookup: function () {
            if (app.current_pos + app.current_width > app.letters.length || app.current_width === 0) {
                app.word_list =[]
                return
            }
            let sliced_letters = app.letters.slice(app.current_pos, app.current_pos + app.current_width)
            let sounds = sliced_letters.map(x => VOWEL_TO_HIRAGANA[x] || CONSONANT_TO_HIRAGANA[x])
            let katakana_results = sound_lookup(sounds)
            app.selected_word_index = 0
            if (katakana_results === null) {
                app.word_list = []
                return
            }
            app.word_list = [].concat(...katakana_results.map(x => dictionary_table[x]))
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
        decrease_width: function () {
            if (app.current_width > 0) {
                app.current_width -= 1
            }
        },
        increase_width: function () {
            if (app.current_pos + app.current_width < app.letters.length) {
                app.current_width += 1
            }
        },
        add_word: function (word_index) {
            if (app.word_list[word_index] !== undefined) {
                app.decrypt += app.word_list[word_index]
                app.current_pos += app.current_width
                app.current_width = 0
            }
        },
        speak_word: function (word_index) {
            if (app.word_list[word_index] !== undefined) {
                speak(app.word_list[word_index])
            }
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

let voice
voice = speechSynthesis.getVoices().filter(x=>x.name == "Kyoko")[0]
if (voice === undefined) {
    speechSynthesis.onvoiceschanged = () => {
        voice = speechSynthesis.getVoices().filter(x=>x.name == "Kyoko")[0]
    }
}

let speak = (text, rate=1, pitch=2) => {
    let speech = new SpeechSynthesisUtterance(text)
    speech.voice = voice
    speech.rate=rate
    speech.pitch=pitch
    speechSynthesis.cancel()
    speechSynthesis.speak(speech)
}

window.onkeydown = (ev) => {
    document.getElementById("phone_input").value = ""
    if (65 <= ev.keyCode && ev.keyCode <= 90) {
        let char = String.fromCharCode(ev.keyCode).toLowerCase();
        app.onKeyInput(char)
    }
    if (ev.code === "ArrowLeft" && AVTIVATE_LEFT_RIGHT == true) {
        app.decrease_width()
    }
    if (ev.code === "ArrowRight" && AVTIVATE_LEFT_RIGHT == true) {
        app.increase_width()
    }
    if (ev.code === "ArrowUp" && AVTIVATE_UP_DOWN_ENTER == true) {
        app.onArrowUp()
    }
    if (ev.code === "ArrowDown" && AVTIVATE_UP_DOWN_ENTER == true) {
        app.onArrowDown()
    }
    if (ev.code === "Enter" && AVTIVATE_UP_DOWN_ENTER == true) {
        app.onEnter()
    }
}

document.getElementById("app").style.display = "block";
