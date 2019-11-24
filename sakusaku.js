let CONSONANT_LIST = Object.keys(CONSONANT_TO_HIRAGANA);

let ACTIVATE_CONV_VOWEL = false;

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