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

sanitized = []

p = re.compile('[\u30A1-\u30FA]+')

for filename in dicts:
    with open(filename, "r") as f:
        for line in f:
            line = line[:-1]
            data = line.split("\t")
            key = jaconv.hira2kata(data[0].replace("ー", ""))
            if not p.fullmatch(key):
                continue
            if len(sanitized) < len(key):
                for _ in range(len(sanitized), len(key)):
                    sanitized.append({})
            if not key in sanitized[len(key) - 1]:
                sanitized[len(key) - 1][key] = []
            if not data[4] in sanitized[len(key) - 1][key]:
                sanitized[len(key) - 1][key].append(data[4])

for i in range(len(sanitized)):
    sanitized[i] = sorted(sanitized[i].items())

with open("dictionary.js", "w") as f:
    f.write("let dictionary = " + json.dumps(sanitized, ensure_ascii=False))
