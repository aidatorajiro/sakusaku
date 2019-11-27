import json
from collections import OrderedDict
import jaconv
import re

dicts = [
    "dictionary_oss/dictionary00.txt",
    "dictionary_oss/dictionary01.txt",
    "dictionary_oss/dictionary02.txt",
    "dictionary_oss/dictionary03.txt",
    "dictionary_oss/dictionary04.txt",
    "dictionary_oss/dictionary05.txt",
    "dictionary_oss/dictionary06.txt",
    "dictionary_oss/dictionary07.txt",
    "dictionary_oss/dictionary08.txt",
    "dictionary_oss/dictionary09.txt"
]

sanitized = {}

p = re.compile('[\u30A1-\u30FA]+')

for filename in dicts:
    with open(filename, "r") as f:
        for line in f:
            line = line[:-1]
            data = line.split("\t")
            key = jaconv.hira2kata(data[0].replace("ー", ""))
            if not p.fullmatch(key):
                continue
            if not key in sanitized:
                sanitized[key] = []
            if not data[4] in sanitized[key]:
                sanitized[key].append(data[4])

sanitized = sorted(sanitized.items())

with open("dictionary.js", "w") as f:
    f.write("let dictionary = " + json.dumps(sanitized, ensure_ascii=False))
