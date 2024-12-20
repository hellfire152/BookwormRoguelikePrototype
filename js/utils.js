class Utils {
    // some wizardry that rounds numbers to the nearest .5
    static roundToHalf(value) {
        var converted = parseFloat(value); // Make sure we have a number
        var decimal = (converted - parseInt(converted, 10));
        decimal = Math.round(decimal * 10);
        if (decimal == 5) { return (parseInt(converted, 10)+0.5); }
        if ( (decimal < 3) || (decimal > 7) ) {
        return Math.round(converted);
        } else {
        return (parseInt(converted, 10)+0.5);
        }
    }

    static roundToOneDP(value) {
       return Number(Math.round(value + 'e1') + 'e-1');
    }

    static loadWordlist() {
        // loads all words into a dictionary
        fetch("words_alpha.txt")
        .then(response => response.text())
        .then((data) => {
            let lines = data.split('\n');
            for (let l = 0; l < lines.length; l++) {
                let w = lines[l].trim();
                if (w.length < 3) {
                    continue;
                }
                wordlist[w] = 1;
            }
        });
    }
    
    static checkWordExists(word) {
        return !!wordlist[word]
    }

    static evaluateInput(word) { 
        // minimum word length is three
        if (word.length < 3) return ui.setSubmitButtonEnabled(false);
        // no blank tiles, stright forward lookup
        if(!word.includes("?")) {
            if (Utils.checkWordExists(word)) {
                return ui.setSubmitButtonEnabled(true);
            } else {
                return ui.setSubmitButtonEnabled(false);
            }
        }

        // has blank tiles, some wizardry is needed
        // generates all possible candidates and checks them until we find a valid word
        // in the future, might just have the player set the letter themselves
        // e.g. on right click a menu pops up for that
        // so we might not have to do this kinda stuff
        let candidates = [];
        let blankIndexes = [];
        for (let i = 0; i < word.length; i++) {
            if (word.charAt(i) == "?") {
                blankIndexes.push(i);
            }
        }
        let depth = 0;
        let charArray = word.split("");
        const candidateGenerator = (function* generateCandidates(d) {
            for (const l of Letter.ALPHABET_SET) {
                charArray[blankIndexes[d]] = l;
                if (d == blankIndexes.length - 1) {
                    yield charArray.join("");
                } else {
                    yield * generateCandidates(d+1);
                }
            }
        })(depth);
        for (let c = candidateGenerator.next().value; c; 
          c = candidateGenerator.next().value) {
            if (Object.hasOwn(wordlist, c)) {
                return ui.setSubmitButtonEnabled(true);
            }
        }
        return ui.setSubmitButtonEnabled(false);
    }


    // some values can be functions or an actual value. this always returns a non function value
    static getValue(v, args) {
        if (_.isFunction(v)) return v(args);
        return v;
    }

    // takes an object and returns a new object with the values assigned to random keys
    static shuffleObject(obj) {
        const keys = Object.keys(obj);
        const values = _.shuffle(Object.values(obj));

        return Object.fromEntries(
            keys.map((key, index) => [key, values[index]])
        );
    }
}