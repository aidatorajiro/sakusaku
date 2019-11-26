let CONSONANT_TO_HIRAGANA = {};

{

    let add_each = function (set, arr) {
        for (let x of arr) {
            set.add(x)
        }
    }

    let first = "kgsztcdnhfpbvmyrwjlq"
    let second = "tyhsw"

    let consonants = new Set()

    for (let i of first) {
        consonants.add(i)
        consonants.add(i + i)
        for (let j of second) {
            consonants.add(i + j)
        }
    }

    let consonants_list = Array.from(consonants)

    let table = {}

    for (let i of consonants_list) {
        let lst = new Set()
        for (let j of ["a", "i", "u", "e", "o"]) {
            let conv = convertRomanToKana(i + j)
            if (conv.match("[a-z]") === null) {
                lst.add(conv)
            }
        }
        table[i] = lst
    }

    // w process
    for (let i of first) {
        let table_arr = Array.from(table[i])
        for (let j of [table_arr[2], table_arr[4]]) {
            for (let k of "ヮァィゥェォ") {
                table[i + "w"].add(j + k)
            }
        }
    }

    // put k and s into c
    add_each(table.c, ["カ","キ","ク","ケ","コ","サ","シ","ス","セ","ソ"])
    add_each(table.cc, ["ッカ","ッキ","ック","ッケ","ッコ","ッサ","ッシ","ッス","ッセ","ッソ"])
    add_each(table.cw, ["スヮ","スァ","スィ","スゥ","スェ","スォ","ソヮ","ソァ","ソィ","ソゥ","ソェ","ソォ"])

    // TODO: make "フゥ and フ" and "ジィ and ジ" and "クゥ and ク" equivalent

    // process n
    delete table.nh
    delete table.nn
    delete table.ns
    delete table.nt
    delete table.nw

    // put r into l
    add_each(table.l, Array.from(table.r))
    add_each(table.ll, Array.from(table.rr))
    add_each(table.lw, Array.from(table.rw))
    add_each(table.ly, Array.from(table.ry))

    // process for empty entries
    for (let i in table) {
        if (table[i].size === 0 || i === "lt") {
            add_each(table[i], Array.from(table[i[0]]))
            add_each(table[i], Array.from(table[i[1]]))
        }
    }

    // make CONSONANT_TO_HIRAGANA from table

    for (let i in table) {
        CONSONANT_TO_HIRAGANA[i] = Array.from(table[i])
    }

}

console.log(JSON.stringify(CONSONANT_TO_HIRAGANA))