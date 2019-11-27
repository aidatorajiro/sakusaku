let dictionary_key;

(async () => {
    dictionary_key = await (await fetch("./dictionary_key.txt")).text()
})()
