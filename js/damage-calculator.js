let LETTER_DAMAGE_VALUES = {
    "a" : 1,
    "b" : 2,
    "c" : 2,
    "d" : 2,
    "e" : 1,
    "f" : 2,
    "g" : 2,
    "h" : 2,
    "i" : 1,
    "j" : 3,
    "k" : 3,
    "l" : 2,
    "m" : 3,
    "n" : 2,
    "o" : 1,
    "p" : 3,
    "q" : 4,
    "r" : 2,
    "s" : 1,
    "t" : 1,
    "u" : 1,
    "v" : 4,
    "w" : 3,
    "x" : 3,
    "y" : 3,
    "z" : 4
}

const LENGTH_DAMAGE_MULTIPLIERS = { // probably replace with an actual formula later
    3 : 1,
    4 : 1,
    5 : 1.1,
    6 : 1.2,
    7 : 1.3,
    8 : 1.55,
    9 : 1.7,
    10 : 1.8,
    11 : 1.9,
    12 : 2.0,
    13 : 2.2,
    14 : 2.5,
    15 : 3.0
}

// some wizardry that rounds numbers to the nearest .5
function roundToHalf(value) {
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

function calculateDamage(letters) {
    let damage = 0;
    let multipliers = []
    for(const l of letters) {
        let baseDamage = LETTER_DAMAGE_VALUES[l.letter];
        switch(l.specialTileType) {
            case SPECIAL_TILE_TYPES.TYPE_1:
                multipliers.push(1.2)
                break;
            case SPECIAL_TILE_TYPES.TYPE_2:
                multipliers.push(1.5)
                break;
        }
        damage += baseDamage;
    }

    //bonus multiplier for long words
    multipliers.push(LENGTH_DAMAGE_MULTIPLIERS[letters.length]); 
    for(const m of multipliers) {
        damage *= parseFloat(m);
    }
    damage = roundToHalf(damage);
    return damage;
}
