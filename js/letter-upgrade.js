/* This file handles upgrades to letter tiles. This will affect all tiles geenrated
from said letter. Many of them allow tiles to generate with specific tile effects
that may also be applied separately */

const MODIFIER_ID = {
    DAMAGE_INCREASE : "LU|DAMAGE_INCREASE",
    PROBABILITY_UP : "LU|PROBABILITY_UP",
    PROBABILITY_DOWN : "LU|PROBABILITY_DOWN",
    POISON : "LU|POISON",
    HARMONIZED : "LU|HARMONIZED",
    EMPHASIS : "LU|EMPHASIS",
    SPIKY : "LU|SPIKY",
    CHARGE_GAIN_UP : "LU|CHARGE_GAIN_UP",
    CHARGE_GAIN_DOWN : "LU|CHARGE_GAIN_DOWN"
}

const COMMON_UPGRADES = ["DAMAGE_INCREASE", "PROBABILITY_DOWN", "PROBABILITY_UP", "CHARGE_GAIN_UP"];

class LetterModifier {
    static generateModifier(upgradeId) {
        switch(upgradeId) {
            case MODIFIER_ID.DAMAGE_INCREASE : {
                return new DamageIncreaseLetterUpgrade();
            }
            case MODIFIER_ID.PROBABILITY_DOWN : {
                return new ProbabilityDecreaseLetterUpgrade();
            }
            case MODIFIER_ID.PROBABILITY_UP : {
                return new ProbabilityIncreaseLetterUpgrade();
            }
            case MODIFIER_ID.CHARGE_GAIN_UP : {
                return new ChargeGainUpLetterModifier();
            }
            case MODIFIER_ID.CHARGE_GAIN_DOWN : {
                return new ChargeGainDownLetterModifier();
            }
            default : {
                throw new Error(`Unimplemented letter modifier ${upgradeId}`);
            }
        }
    }
    constructor(data) {
        this.id = data.id;
        this.name = data.name;
        this.sprite = data.sprite;
        this.isUpgrade = data.isUpgrade;
    }

    // define these functions to implement the upgrade
    apply(letter) {} // called in the Letter constructor
    onAdd(letter) {}
    onRemove(letter) {}

    generateShopElement() {
        let modifierContainer = $("<div>");
        modifierContainer.addClass("modifier-container");
        modifierContainer.attr("_modifierid", this.id)

        let modifierName = $("<div>");
        modifierName.addClass("modifier-name");
        modifierName.text(this.name);

        let modifierSprite = $("<img>");
        modifierSprite.addClass("modifier-sprite");
        modifierSprite.attr("src", this.sprite);

        modifierContainer.append(modifierName, modifierSprite);
        return modifierContainer;
    }
    generateStatScreenElement() {
        let modifierContainer = $("<div>");

    }
}

class DamageIncreaseLetterUpgrade extends LetterModifier {
    constructor(data){
        super({
            id : MODIFIER_ID.DAMAGE_INCREASE,
            name : "Damage Up",
            sprite : "./sprites/upgrades/dmgUP.png",
            isUpgrade : true
        });
    }

    onAdd(letter) {
        let damageIncrease = LETTER_UPGRADE_DAMAGE_INCREASE[letter]
        LETTER_DAMAGE_VALUES[letter] += damageIncrease;
        log(`Increased the base damage of "${letter}" by ${damageIncrease}`);
    }

    onRemove(letter) {
        let damageIncrease = LETTER_UPGRADE_DAMAGE_INCREASE[letter]
        LETTER_DAMAGE_VALUES[letter] -= damageIncrease;
        log(`Reduced the base damage of "${letter}" by ${damageIncrease}`);
    }
}

class ProbabilityIncreaseLetterUpgrade extends LetterModifier {
    constructor(value) {
        super({
            id : MODIFIER_ID.PROBABILITY_UP,
            name : "Probability up",
            sprite : "./sprites/upgrades/TileRateUP.png",
            isUpgrade : true
        });
        this.value = value || 20;
    }

    onAdd(letter) {
        LETTER_PROBABILITY_POINTS[letter] += this.value;
        log(`${letter} is now slighly more likely to appear`);
        Letter.calculateLetterProbabilityThresholds();
    }

    onRemove(letter) {
        LETTER_PROBABILITY_POINTS[letter] -= this.value;
        log(`${letter} is now slightly less likely to appear again`);
        Letter.calculateLetterProbabilityThresholds();
    }
}

class ProbabilityDecreaseLetterUpgrade extends LetterModifier {
    constructor(value) {
        super({
            id : MODIFIER_ID.PROBABILITY_DOWN,
            name : "Probability Down",
            sprite : "./sprites/upgrades/TileRateDown.png",
            isUpgrade : true
        })
        this.value = value || 20;
    }

    onAdd(letter) {
        if (LETTER_PROBABILITY_POINTS[letter] > this.value * 2) {
            LETTER_PROBABILITY_POINTS[letter] -= this.value;
        } else {
            LETTER_PROBABILITY_POINTS[letter] /= 2;
        }
        log(`${letter} is less likely to appear`);
        Letter.calculateLetterProbabilityThresholds();
    }

    onRemove(letter) {
        if (LETTER_PROBABILITY_POINTS[letter] <= this.value) {
            LETTER_PROBABILITY_POINTS[letter] *= 2;
        } else {
            LETTER_PROBABILITY_POINTS[letter] += this.value;
        }
        log(`${letter} is more likely to appear again`);
        Letter.calculateLetterProbabilityThresholds();
    }
}

class ChargeGainUpLetterModifier extends LetterModifier {
    constructor(value) {
        super({
            id : MODIFIER_ID.CHARGE_GAIN_UP,
            name : "Increase Charge Gain",
            sprite : "./sprites/Questionmorks.png",
            isUpgrade : true
        })
        this.value = value || 0.5;
    }

    onAdd(letter) {
        letterChargeBonus[letter] += this.value;
        log(`Charge gain of ${letter} tiles increased by ${this.value}`);
    }

    onRemove(letter) {
        letterChargeBonus[letter] -= this.value;
        log(`Charge gain of ${letter} reduced by ${this.value}`);
    }
}

class ChargeGainDownLetterModifier extends LetterModifier {
    constructor(value) {
        super({
            id : MODIFIER_ID.CHARGE_GAIN_DOWN,
            name : "Decrease Charge Gain",
            sprite : "./sprites/Questionmorks.png",
            isUpgrade : false
        })
        this.value = value || 0.5;
    }

    onAdd(letter) {
        letterChargeBonus[letter] -= this.value;
        log(`Charge gain of ${letter} reduced by ${this.value}`);
    }

    onRemove(letter) {
        letterChargeBonus[letter] += this.value;
        log(`Charge gain of ${letter} tiles increased by ${this.value}`);
    }
}

class PoisonLetterUpgrade extends LetterModifier {
    constructor() {
        super({
            id : MODIFIER_ID.POISON,
            name : "Poisonous",
            sprite : "./sprites/relics/Poison.png",
            isUpgrade : true
        });
    }

    apply(letter) {
        letter.tileEffects[TILE_EFFECTS.POISONOUS] = TileEffect.poisonous(99);
    }
}


class LetterModifierHandler {
    constructor() {
        this.letterModifiers = {
            "a" : [],
            "b" : [],
            "c" : [],
            "d" : [],
            "e" : [],
            "f" : [],
            "g" : [],
            "h" : [],
            "i" : [],
            "j" : [],
            "k" : [],
            "l" : [],
            "m" : [],
            "n" : [],
            "o" : [],
            "p" : [],
            "q" : [],
            "r" : [],
            "s" : [],
            "t" : [],
            "u" : [],
            "v" : [],
            "w" : [],
            "x" : [],
            "y" : [],
            "z" : []
        }
    }

    addModifier(letter, letterModifier) {
        this.letterModifiers[letter].push(letterModifier);
        letterModifier.onAdd(letter);
    }

    addModifierFromId(letter, modifierId) {
        this.addModifier(letter, LetterModifier.generateModifier(modifierId));
    }

    removeModifier(letter, modifierId) {
        for (let i = 0; i < this.letterModifiers[letter]; i++) {
            let lu = this.letterModifiers[letter][i];
            if (lu.id == modifierId) {
                this.letterModifiers[letter] = this.letterModifiers[letter].splice(i, 1);
                lu.onRemove(letter);
                return true;
            }
        }
        return false;
    }

    getModifiersOfLetter(letter) {
        return this.letterModifiers[letter];
    }
}