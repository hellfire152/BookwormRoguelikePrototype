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

    static loadWordlist() {
        // loads all words into a dictionary
        fetch("words_alpha.txt")
        .then(response => response.text())
        .then((data) => {
        let lines = data.split('\n');
        for (let l = 0; l < lines.length; l++) {
            wordlist[lines[l].trim()] = 1
        }
        });
    }
    
    static checkWordExists(word) {
        return !!wordlist[word]
    }

    static evaluateInput() {
        let word = ui.getWordInInput();
    
        if (Utils.checkWordExists(word) && word.length >= 3) {
            ui.setSubmitButtonEnabled(false);
        } else {
            ui.setSubmitButtonEnabled(true);
        }
    }
    // some values can be functions or variables. this always returns a non function value
    static getValue(v, args) {
        if (_.isFunction(v)) return v(args);
        return v;
    }
}