var LETTER_PROBABILITY_POINTS = {
    "a" : 70,
    "b" : 20,
    "c" : 20,
    "d" : 40,
    "e" : 80,
    "f" : 20,
    "g" : 20,
    "h" : 40,
    "i" : 70,
    "j" : 10,
    "k" : 10,
    "l" : 40,
    "m" : 20,
    "n" : 40,
    "o" : 70,
    "p" : 20,
    "q" : 5,
    "r" : 40,
    "s" : 40,
    "t" : 50,
    "u" : 60,
    "v" : 10,
    "w" : 20,
    "x" : 10,
    "y" : 20,
    "z" : 10
}
var LETTER_PROBABILTY_THRESHOLDS = {
    "a" : 0,
    "b" : 0,
    "c" : 0,
    "d" : 0,
    "e" : 0,
    "f" : 0,
    "g" : 0,
    "h" : 0,
    "i" : 0,
    "j" : 0,
    "k" : 0,
    "l" : 0,
    "m" : 0,
    "n" : 0,
    "o" : 0,
    "p" : 0,
    "q" : 0,
    "r" : 0,
    "s" : 0,
    "t" : 0,
    "u" : 0,
    "v" : 0,
    "w" : 0,
    "x" : 0,
    "y" : 0,
    "z" : 0
}
let LETTER_PROBABILITY_POINT_MAX = 0;

const SPECIAL_TILE_TYPES = {
    TYPE_1 : 2,
    TYPE_2 : 3,
    UNSELECTABLE : 1,
}

class Letter {
    static ALPHABET_SET = 'abcdefghijklmnopqrstuvwxyz'
    // Can't store all the letter data I want in a html element
    // this is a bit of a workaround
    static _letterStore = {};
    static storeLetter(ref, element) {
        Letter._letterStore[ref] = element;
        return true;
    }
    static retrieveLetter(ref) {
        return Letter._letterStore[ref];
    }
    static getLetterObjectFromElement(e) {
        let j = $(e);
        return Letter.retrieveLetter(j.attr("_letterref"));
    }
    static removeLetter(ref) {
        delete Letter._letterStore[ref];
    }
    static removeLetterFromElement(e) {
        let j = $(e);
        let ref = j.attr("_letterref");
        Letter.removeLetter(ref);
        j.remove();
    }

    static refreshAllLetters() {
        let letters = UI.Letter.getLetters();
        letters.each((index, letter) => {
            let l = Letter.getLetterObjectFromElement(letter);
            l.rerollLetter($(letter));
        });
    }
    static randomLetterMatchingProbabilities() {
        let max = LETTER_PROBABILITY_POINT_MAX;
        let randomInt = Math.floor(Math.random() * max + 1);
        let result = "a";
        for (const l in LETTER_PROBABILTY_THRESHOLDS) {
            if (randomInt <= LETTER_PROBABILTY_THRESHOLDS[l]) {
                return l;
            }
        }
        throw new Error(`${randomInt} unable to generate random letter!`);
    }
    static calculateLetterProbabilityThresholds() {
        let threshold = 0;
        LETTER_PROBABILITY_POINT_MAX = 0; // reset max
        for (const l in LETTER_PROBABILITY_POINTS) {
            LETTER_PROBABILITY_POINT_MAX += LETTER_PROBABILITY_POINTS[l];
            threshold += LETTER_PROBABILITY_POINTS[l];
            LETTER_PROBABILTY_THRESHOLDS[l] = threshold;
        }
    }
    
    static generateLetters(noLettersToGenerate, specialTilesToGenerate) {
        if (typeof noLettersToGenerate == 'undefined') {
            noLettersToGenerate = GAME_CONSTANTS.STARTING_LETTER_COUNT;
        }

        const specialTileGenerator = (function* getNextSpecialTile(sttg) {
            if(!sttg) return;
            if (sttg[SPECIAL_TILE_TYPES.TYPE_2]) {
                sttg[SPECIAL_TILE_TYPES.TYPE_2]--;
                yield SPECIAL_TILE_TYPES.TYPE_2;
            } else if (sttg[SPECIAL_TILE_TYPES.TYPE_1]) {
                sttg[SPECIAL_TILE_TYPES.TYPE_1]--;
                yield SPECIAL_TILE_TYPES.TYPE_1;
            } else yield undefined;
        })(specialTilesToGenerate);

        for(let i = 0; i < noLettersToGenerate; i++) {
            let specialTile = specialTileGenerator.next().value;
            let letter = new Letter(Letter.randomLetterMatchingProbabilities(), specialTile)

            let element = letter.generateElement();
            UI.Letter.appendLetterElement(element);
        }
    }

    // some tiles can contain multiple letters. This function get the true submitted word length
    // even if those tiles are used
    static countTrueLength(letters) {
        let length = 0;
        for(const letter of letters) {
            for(const l of letter.letter) {
                length++;
            }
        }
        return length;
    }
    constructor(l, specialTileType) {
        this.letter = l;
        this.powerup = null;
        this.locked = null;
        this.specialTileType = (specialTileType)? specialTileType : null;
        this.ref = crypto.randomUUID();
        this.tileEffects = {
            
        }
    }

    generateElement() { // jquery element to add to DOM
        let element = $("<div></div>");
        element.addClass('letter');
        element.text((this.letter == "?") ? "" : this.letter);
        element.attr("_letterref", this.ref); 
        
        switch(this.specialTileType) {
            case SPECIAL_TILE_TYPES.TYPE_1:
                element.css("background-color", "#e09fed");
                break;
            case SPECIAL_TILE_TYPES.TYPE_2:
                element.css("background-color", "#9fc6ed");
                break;
            case SPECIAL_TILE_TYPES.UNSELECTABLE:
                element.addClass("placeholder-letter");
                element.attr("_pfor", this.placeholder_for)
                break;
        }

        if (this.specialTileType != SPECIAL_TILE_TYPES.UNSELECTABLE) {
            Letter.storeLetter(this.ref, this);
        }
        return element;
    }

    rerollLetter(elementToReplace) {
        this.replaceLetter(elementToReplace, Letter.randomLetterMatchingProbabilities());
    }
    replaceLetter(elementToReplace, newLetter) {
        this.letter = newLetter;
        elementToReplace.replaceWith(this.generateElement());
    }
}
