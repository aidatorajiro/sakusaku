function sound_lookup(list_of_sounds) {
    let regex = "^" + list_of_sounds.map(x => "(" + x.join("|") + ")").join("") + "$"
    console.log(regex)
    return dictionary_key.match(new RegExp(regex, "mg"))
}