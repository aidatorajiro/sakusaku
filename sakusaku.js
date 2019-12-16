let app = new Vue({
    el: '#app',
    data: {
        original_text: "",
        vowel: "",
        consonant: "",
        letters: [],
        decrypt: "",
        decrypt_katakana: "",
        current_pos: 0,
        word_list: [],
        word_position: [],
        mouse_left: 0,
        mouse_top: 0,
        selected_word_index: 0,
        mode: "writing"
    },
    watch: {
        current_pos: function () {
            app.start_lookup()
            app.update_selected_word_index()
        },
        mouse_left: function () {
            app.update_selected_word_index()
        },
        mouse_top: function () {
            app.update_selected_word_index()
        }
    },
    methods: {
        // style generator functions
        calculate_word_position: function () {
            let word_position = []
            /* Method 1: circle with modulo */
            if (WORD_LAYOUT == "CIRCLE_MODULO") {
                for (let i = 0; i < app.word_list.length; i++) {
                    let theta_top = 2*Math.PI*(i/app.word_list.length)
                    let theta_left = 2*Math.PI*(i/app.word_list.length)
                    let radius_top = window.innerHeight / 2 - 40 - 30*(i % 3)
                    let radius_left = window.innerWidth / 2 - 40 - 30*(i % 3)
                    let offset_top = window.innerHeight / 2
                    let offset_left = window.innerWidth / 2
                    word_position.push([
                        Math.sin(theta_top) * radius_top + offset_top,
                        Math.cos(theta_left) * radius_left + offset_left
                    ])
                }
            }

            /* Method 2: random with antigravity */
            if (WORD_LAYOUT == "RANDOM_ANTIGRAVITY") {
                for (let i = 0; i < app.word_list.length; i++) {
                    let top = Math.random() * window.innerHeight
                    let left = Math.random() * window.innerWidth
                    word_position.push([
                        top,
                        left
                    ])
                }

                for (let epoch = 0; epoch < 100; epoch++) {
                    for (let i = 0; i < word_position.length; i++) {
                        for (let j = 0; j < i; j++) {
                            let it = word_position[i][0]
                            let il = word_position[i][1]
                            let jt = word_position[j][0]
                            let jl = word_position[j][1]
                            let dt = (jt - it)
                            let dl = (jl - il)
                            let dist = dt*dt + dl*dl
                            if (dist < 40) {
                                word_position[i][0] -= 100 * dt / dist
                                word_position[i][1] -= 100 * dl / dist
                                word_position[j][0] += 100 * dt / dist
                                word_position[j][1] += 100 * dl / dist
                            }
                        }
                    }
                }
            }

            /* Method 3: LATTICE */
            if (WORD_LAYOUT == "LATTICE") {
                let columns = Math.ceil(Math.sqrt(app.word_list.length * window.innerWidth / window.innerHeight))
                let rows = Math.ceil(app.word_list.length / columns)
                let cell_width = window.innerWidth / columns
                let cell_height = window.innerHeight / rows
                for (let c = 0; c < columns; c++) {
                    for (let r = 0; r < rows; r++) {
                        let top = r * cell_height
                        let left = c * cell_width
                        word_position.push([
                            top,
                            left
                        ])
                    }
                }
            }

            app.word_position = word_position
        },
        // Keyboard process functions
        onKeyInput: function (char) {
            if (app.mode !== "writing") { return; }

            app.original_text += char
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
        // internal functions
        update_selected_word_index: function () {
            if (app.mode !== "choose") { return; }

            let diff;

            if (WORD_CHOICE_METHOD == "ANGLE") {
                diff = app.word_position.map(p => Math.abs(
                    Math.atan2(
                        app.mouse_top - window.innerHeight / 2,
                        app.mouse_left - window.innerWidth / 2
                    )
                    -
                    Math.atan2(
                        p[0] - window.innerHeight / 2,
                        p[1] - window.innerWidth / 2
                    )
                ));
            }

            if (WORD_CHOICE_METHOD == "DISTANCE") {
                diff = app.word_position.map(p => 
                    (app.mouse_top - p[0])*(app.mouse_top - p[0]) +
                    (app.mouse_left - p[1])*(app.mouse_left - p[1])
                );
            }

            // select the word with lowest diff value
            let index = diff.indexOf(Math.min(...diff))
            if (app.selected_word_index !== index) {
                app.speak_word(index)
            }
            app.selected_word_index = index
        },
        start_lookup: function () {
            let word_list = [];
            if (app.letters.length === app.current_pos) {
                speak(app.decrypt)
            }
            for (let width = 1; width < Math.min(LIMIT_LOOKUP + 1, app.letters.length - app.current_pos + 1); width++) {
                let sliced_letters = app.letters.slice(app.current_pos, app.current_pos + width)
                let sounds = sliced_letters.map(x => VOWEL_TO_KATAKANA[x] || CONSONANT_TO_KATAKANA[x])
                let katakana_results = sound_lookup(sounds)
                if (katakana_results !== null) {
                    // word selialization format: [kanji & hiragana representation, width of the word, katakana pronounciation]
                    let word_results = katakana_results.map(x => dictionary_table[x].map(y => [y[0], width, y[1]]))
                    word_list.push(...[].concat(...word_results))
                } else if (width === 1) {
                    word_list.push(...sounds[0].map(y => [y, width, y]))
                }
            }
            app.word_list = word_list
            app.calculate_word_position()
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
        add_word: function (word_index) {
            if (app.word_list[word_index] !== undefined) {
                app.decrypt += app.word_list[word_index][0]
                app.decrypt_katakana += app.word_list[word_index][2]
                app.current_pos += app.word_list[word_index][1]
            }
        },
        speak_word: function (word_index) {
            if (app.word_list[word_index] !== undefined) {
                speak(app.word_list[word_index][2])
            }
        },
        go_to_choose_mode: function() {
            app.mode = "choose"

            app.start_lookup()

            setInterval(()=>{
                app.add_word(app.selected_word_index)
            }, 2000)
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
    if (65 <= ev.keyCode && ev.keyCode <= 90) {
        let char = String.fromCharCode(ev.keyCode).toLowerCase();
        app.onKeyInput(char)
    }
}

window.onmousemove = (ev) => {
    app.mouse_left = ev.clientX
    app.mouse_top = ev.clientY
}

document.getElementById("app").style.display = "block";
