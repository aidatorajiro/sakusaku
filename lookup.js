// Assume that for some natural number k between "start" and "end",
//   for all natural number n in the range, k <= n <-> cond(n) = true.
// Effectively find such k for given cond(x).
// Special cases: returns start if cond(x) = 1 for all x in the range
//                returns end + 1 if cond(x) = 0 for all x in the range
function binary_search(cond, start, end) {
    while (true) {
        if (start === end) {
            if (cond(start) === true) {
                return start
            } else {
                return start + 1
            }
        }
        let left_start = start
        let left_num = Math.floor((end - start + 1)/2)
        let right_start = start + left_num
        let right_num = end - start + 1 - left_num
        if (cond(right_start) === true) {
            start = left_start
            end = right_start - 1
            continue
        } else {
            start = right_start
            end = end
            continue
        }
    }
}

function string_to_number(string) {
    let num = 0
    for (let i = 0; i < string.length; i++) {
        num = num*65535
        num += string.charCodeAt(i) % 65535
    }
    return num
}

// From a dictionary, get the range of the entries start with "char".
// Lookup will be started from "offset"-th character.
// You can specify the search range by "from" and "to".
// All keys in the dictionary MUST ONLY include katakanas and MUST be sorted in accending order.
// In failure, return null.
function lookup(char, offset = 0, from = 0, to = dictionary.length - 1) {
    if (char === "") {
        return null
    }

    let num = string_to_number(char)

    let start = binary_search((x)=>(
        num <= string_to_number(dictionary[x][0].substr(offset, char.length).padEnd(char.length))
    ), from, to)

    let end = binary_search((x)=>(
        num < string_to_number(dictionary[x][0].substr(offset, char.length).padEnd(char.length))
    ), from, to) - 1

    if (start === end + 1) {
        return null
    }

    return [start, end]
}

function lookup_sound_set(sound_list, offset, from, to) {
    let range_list = []
    for (let sound of sound_list) {
        let range = lookup(sound, offset, from, to)
        if (range !== null) {
            range_list.push([range[0], range[1], sound.length])
        }
    }
    return range_list
}

function lookup_sound_set_set(list_of_sound_list) {
    
}
