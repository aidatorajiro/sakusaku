let app = new Vue({
    el: '#app',
    data: {
        vowel: "",
        consonant: "",
        letters: [],
        decrypt: "",
        current_pos: 0,
        word_list: [],
        word_position: [],
        mouse_left: 0,
        mouse_top: 0,
        selected_word_index: 0
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

            /* Method 2: random with antigravity */
            /*
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
                        console.log(dist, 100 * dt / dist, 100 * dl / dist)
                    }
                }
            }
            }
            */

            /*
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
            }*/

            app.word_position = word_position
        },
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
        // internal functions
        update_selected_word_index: function () {
            let angle_diff = app.word_position.map(p => Math.abs(
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
            app.selected_word_index = angle_diff.indexOf(Math.min(...angle_diff))
        },
        start_lookup: function () {
            let word_list = [];
            for (let width = 1; width < Math.min(LIMIT_LOOKUP + 1, app.letters.length - app.current_pos + 1); width++) {
                let sliced_letters = app.letters.slice(app.current_pos, app.current_pos + width)
                let sounds = sliced_letters.map(x => VOWEL_TO_HIRAGANA[x] || CONSONANT_TO_HIRAGANA[x])
                let katakana_results = sound_lookup(sounds)
                if (katakana_results === null) { continue; }
                word_list = word_list.concat(
                    [].concat(...katakana_results.map(x => dictionary_table[x]))
                      .map(x => [x, width])
                )
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
                app.current_pos += app.word_list[word_index][1]
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
    if (65 <= ev.keyCode && ev.keyCode <= 90) {
        let char = String.fromCharCode(ev.keyCode).toLowerCase();
        app.onKeyInput(char)
    }
}

window.onmousemove = (ev) => {
    app.mouse_left = ev.clientX
    app.mouse_top = ev.clientY
}

setInterval(()=>{
    app.add_word(app.selected_word_index)
}, 2000)

document.getElementById("app").style.display = "block";
