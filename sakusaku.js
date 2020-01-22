let app = new Vue({
    el: '#app',
    data: {
        vowel: "",
        consonant: "",
        letters: [],
        segments: [], // segmented original text
        current_segment: "",
        decrypt: "",
        decrypt_katakana: "",
        current_pos: 0,
        word_list: [],
        word_position: [],
        mouse_left: 0,
        mouse_top: 0,
        selected_word_index: 0,
        mode: "writing_1",
        progress: 0
    },
    watch: {
        current_pos: function () {
            if (app.mode !== "choose") { return; }
            app.start_lookup()
            app.update_selected_word_index(true)
        },
        mouse_left: function () {
            if (app.mode !== "choose") { return; }
            app.update_selected_word_index()
        },
        mouse_top: function () {
            if (app.mode !== "choose") { return; }
            app.update_selected_word_index()
        }
    },
    methods: {
        reset_all: function () {
            app.vowel = ""
            app.consonant = ""
            app.letters = []
            app.segments = []
            app.current_segment = ""
            app.decrypt = ""
            app.decrypt_katakana = ""
            app.current_pos = 0
            app.word_list = []
            app.word_position = []
            app.mouse_left = 0
            app.mouse_top = 0
            app.selected_word_index = 0
            app.mode = "writing_1"
            app.progress = 0
        },
        // style generator functions
        calculate_word_position: function () {
            let word_position = []

            let box_width = window.innerWidth;
            let box_height = window.innerHeight - 50;
            let fontsize = 40;

            /* Method 1: circle with modulo */
            if (WORD_LAYOUT == "CIRCLE_MODULO") {
                for (let i = 0; i < app.word_list.length; i++) {
                    let theta_top = 2*Math.PI*(i/app.word_list.length)
                    let theta_left = 2*Math.PI*(i/app.word_list.length)
                    let radius_top = box_height / 2 - 40 - 30*(i % 3)
                    let radius_left = box_width / 2 - 40 - 30*(i % 3)
                    let offset_top = box_height / 2
                    let offset_left = box_width / 2
                    word_position.push([
                        Math.sin(theta_top) * radius_top + offset_top,
                        Math.cos(theta_left) * radius_left + offset_left
                    ])
                }
            }

            /* Method 2: random with antigravity */
            if (WORD_LAYOUT == "RANDOM_ANTIGRAVITY") {
                for (let i = 0; i < app.word_list.length; i++) {
                    let top = Math.random() * box_height
                    let left = Math.random() * box_width
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
                let columns = Math.ceil(Math.sqrt(app.word_list.length * box_width / box_height))
                let rows = Math.ceil(app.word_list.length / columns)
                let cell_width = box_width / columns
                let cell_height = box_height / rows
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

            /* Method 4: TSUME */
            if (WORD_LAYOUT == "TSUME") {
                let wordsum = app.word_list.map(x => x[0]).join("").length;
                let wordlim_left = Math.sqrt(wordsum*(box_width)/(box_height))*fontsize;

                let current_left = 0;
                let current_top = 0;
                let pre_word_position = []
                for (let i = 0; i < app.word_list.length; i++) {
                    let word_len = app.word_list[i][0].length;
                    let wordsize_left = fontsize * word_len;
                    let wordsize_top = fontsize;
                    pre_word_position.push([
                        current_top,
                        current_left,
                        wordsize_top,
                        wordsize_left
                    ])
                    current_left += wordsize_left;
                    if (current_left > wordlim_left) {
                        current_left = 0
                        current_top += fontsize
                    }
                }
                
                let top_max = 0; // Max of top (height of the word included)
                let top_max_wordsize_top = 0;
                let left_max = 0; // Max of left (width of the word included)
                let left_max_wordsize_left = 0;
                for (let i = 0; i < pre_word_position.length; i++) {
                    let top = pre_word_position[i][0] + pre_word_position[i][2]
                    let left = pre_word_position[i][1] + pre_word_position[i][3]

                    if (top > top_max) {
                        top_max = top
                        top_max_wordsize_top = pre_word_position[i][2]
                    }

                    if (left > left_max) {
                        left_max = left
                        left_max_wordsize_left = pre_word_position[i][3]
                    }
                }

                let coeff_top = (box_height - top_max_wordsize_top) / (top_max - top_max_wordsize_top)
                if (!isFinite(coeff_top)) {
                    coeff_top = 1
                }

                let coeff_left = (box_width - left_max_wordsize_left) / (left_max - left_max_wordsize_left)
                if (!isFinite(coeff_left)) {
                    coeff_left = 1
                }

                for (let i = 0; i < pre_word_position.length; i++) {
                    let top = pre_word_position[i][0] * coeff_top
                    let left = pre_word_position[i][1] * coeff_left
                    word_position.push([
                        top + pre_word_position[i][2] / 2,
                        left + pre_word_position[i][3] / 2
                    ])
                }
            }

            let box_offset_top = 50;
            let box_offset_left = 0;

            app.word_position = word_position.map(x => [x[0] + box_offset_top, x[1] + box_offset_left])
        },
        // Keyboard process functions
        onKeyInput: function (char) {
            if (app.mode !== 'writing_1' && app.mode !== 'writing_2') { return; }
            if (app.letters.length > 0) {
                app.mode = "writing_2"
            }

            app.current_segment += char
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
        update_selected_word_index: function (force_speak = false) {
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
            if (index == -1) {
                index = 0
            }
            if (force_speak || app.selected_word_index !== index) {
                app.speak_word(index)
            }
            app.selected_word_index = index
        },
        start_lookup: function () {
            if (app.mode !== "choose") { return; }
            let word_list = [];
            if (app.letters.length === app.current_pos) {
                app.final_speak()
            }
            for (let width = 1; width < Math.min(LIMIT_LOOKUP + 1, app.letters.length - app.current_pos + 1); width++) {
                let sliced_letters = app.letters.slice(app.current_pos, app.current_pos + width)
                let sounds = sliced_letters.map(x => VOWEL_TO_KATAKANA[x] || CONSONANT_TO_KATAKANA[x])
                let katakana_results = sound_lookup(sounds)
                if (katakana_results !== null) {
                    // word selialization format: [kanji / hiragana / katakana representation, width of the word, pronunciation]
                    let word_results = katakana_results.map(x => dictionary_table[x].map(y => [y[0], width, y[1]]))
                    word_list.push(...[].concat(...word_results))
                } else if (width === 1) {
                    word_list.push(...sounds[0].map(y => [y, width, y]))
                }
            }
            shuffle(word_list)
            app.word_list = word_list
            app.calculate_word_position()
        },
        put_letter: function () {
            if (app.consonant == "") {
                app.letters.push(conv_vowel(app.vowel))
            } else {
                app.letters.push(app.consonant)
            }
            app.segments.push(app.current_segment)
            app.current_segment = ""
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
                speak(app.word_list[word_index][2], 0.1, 1)
            }
        },
        final_speak: function () {
            speak(app.decrypt_katakana, 0.1, 1, true)
            speak(app.decrypt, 0.1, 1, true)
            app.mode = "final"
        },
        go_to_choose_mode: function() {
            app.mode = "choose"
            app.start_lookup()
            app.update_selected_word_index(true)
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

let speak = (text, rate, pitch, wait = false) => {
    let speech = new SpeechSynthesisUtterance(text)
    speech.voice = voice
    speech.rate = rate
    speech.pitch = pitch
    if (!wait) {
        speechSynthesis.cancel()
    }
    speechSynthesis.speak(speech)
}

let shuffle = (a) => {
    var j, x, i;
    for (i = a.length - 1; i > 0; i--) {
        j = Math.floor(Math.random() * (i + 1));
        x = a[i];
        a[i] = a[j];
        a[j] = x;
    }
    return a;
}

/* interval funcs */
setInterval(function () {
    if (app.mode == 'final' && !speechSynthesis.speaking) {
        app.mode = 'reset'
        setTimeout(function () {
            app.reset_all()
        }, 13000)
    }
}, 1000)

setInterval(function () {
    if (app.mode == 'writing_1' || app.mode == 'writing_2') {
        window.scrollBy(0, 1);
    }
}, 20)

setInterval(function () {
    if (app.mode == 'choose') {
        app.progress += 0.008333333333333333
        if (app.progress > 1) {
            app.add_word(app.selected_word_index)
            app.progress = 0
        }
    }
}, 1000/60)

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
