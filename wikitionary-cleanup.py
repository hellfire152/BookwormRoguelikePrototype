import json
import re
from datetime import datetime

def checkValidWord(word):
    alphaRegex = re.compile(r"^[a-z]+$")

    if alphaRegex.match(word) and len(word) >= 3:
        return True
    return False
    
def main():
    output_wordlist = {}
    with open("kaikki.org-dictionary-English.jsonl", encoding='utf-8') as f:
        count = 0
        word_count = 0
        for line in f:
            count = count + 1
            l = line.strip()
            word_data = json.loads(l)
            word = word_data["word"].lower()

            # filter out a buncha garbage
            if not checkValidWord(word):
                continue
            
            word_count = word_count + 1
            if word not in output_wordlist:
                output_wordlist[word] = {
                    "types" : set(),
                    "tags" : set(),
                    "forms" : set(),
                    "topics" : set()
                }

            data = output_wordlist[word]
            data["types"].add(word_data["pos"])
            if "forms" in word_data:
                for form in word_data["forms"]:
                    if not checkValidWord(form["form"]) : continue # skip multi-word forms
                    data["forms"].add(form["form"])
                    if form["form"] not in output_wordlist:
                        output_wordlist[form["form"]] = {
                            "types" : set(),
                            "tags" : set(),
                            "forms" : set(),
                            "topics" : set()
                        }
                        output_wordlist[form["form"]]["types"].add(word_data["pos"])
            for sense in word_data["senses"]:
                if "tags" in sense:
                    for tag in sense["tags"]:
                        data["tags"].add(tag)
                if "topics" in sense:
                    for topic in sense["topics"]:
                        data["topics"].add(topic)
            print(f"Finished: {count}", end="\r")
            # if count > 10: break # for testing

        print(f"{word_count} words processed.")
        # copy tags of base words to their other forms
        for w in output_wordlist:
            word = output_wordlist[w]
            for form in word["forms"]:
                output_wordlist[form]["tags"].update(word["tags"])
                output_wordlist[form]["topics"].update(word["topics"])

        # turn sets into lists so that it can be encoded to json
        for w in output_wordlist:
            word = output_wordlist[w]
            word["types"] = list(word["types"])
            word["tags"] = list(word["tags"])

            if len(word["tags"]) > 0:
                word["tags"] = list(word["tags"])
            else:
                word.pop("tags", None)
            if len(word["topics"]) > 0:
                word["topics"] = list(word["topics"])
            else:
                word.pop("topics", None)

            word.pop('forms', None)

        with open("word-output.json", "w") as f2:
            json.dump(output_wordlist, f2)           

if __name__ == "__main__":
    start_time = datetime.now()
    main()
    end_time = datetime.now()
    print(f"Program execution finished in : {end_time - start_time}")