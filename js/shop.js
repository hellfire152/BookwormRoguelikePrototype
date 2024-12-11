const CONSUMABLE_ID = {
    HEALING_POTION : 0, //heals for a set amount of HP
    MOLOTOV : 1, // deals a set amount of damage
    SINGLE_TILE_REROLL : 2, // rerolls a single tile
    INSTANT_REFRESH : 3, // rerolls all tiles without skipping a turn
    NEW_KNOWLEDGE : 4, // adds a set number of extra tiles
    //OMNISCIENCE : 5, // plays the longest possible word for you
}

const CONSUMABLE_DETAILS = {
    0 : {
        name : "Healing potion",
        onUse : () => {
            player.healDamage(10);
            log("Healed 10 HP!");
            return true;
        },
        baseCost : 30,
        sprite : "/sprites/consumables/Potion.png",
    },
    1 : {
        name : "Throwing Knives",
        onUse : () => {
            if (currentEnemy) {
                currentEnemy.dealDamage(20);
                log(`Dealt 20 damage to ${currentEnemy.name}!`);
                return true;
            }
            log("No enemy to deal damage to!");
            return false;
        },
        baseCost : 30,
        sprite : "/sprites/consumables/Knife1.png",
    },
    2 : {
        name : "Single Tile Reroll",
        onUse : () => {
            if (gameState != GAME_CONSTANTS.GAME_STATES.COMBAT) {
                log("Can only be used in combat!");
                return false;
            }
            // highlight all letters
            let letters = $(".letter:not(.placeholder-letter)");
            letters.addClass("temporary-highlight");
            letters.one('click', (e) => {
                let t = $(e.target);
                let letter = Letter.getLetterObjectFromElement(t);
                letter.rerollLetter(t);
                letters.removeClass("temporary-highlight");
                letters.off("click");
                log("Rerolled a single tile");
            });
            return true;
        },
        baseCost : 20,
        sprite : "/sprites/consumables/RerollTile.png",
    },
    3 : {
        name : "Instant Full Refresh",
        onUse : () => {
            if (gameState == GAME_CONSTANTS.GAME_STATES.COMBAT) {
                Letter.refreshAllLetters();
                log("Rerolled all letters!");
            } else {
                log("Can only be used in combat!");
                return false;
            }
            return true;
        },
        baseCost : 60,
        sprite : "/sprites/consumables/ClearTile.png",
    },
    4 : {
        name : "Tile Delivery",
        onUse : () => {
            if (gameState == GAME_CONSTANTS.GAME_STATES.COMBAT) {
                generateLetters(3);
                log("3 Extra Tiles were generated!");
                return true;
            } else {
                log("Can only be used in combat!");
                return false;
            }
        },
        baseCost : 50,
        sprite : "/sprites/consumables/Donki.png",
    }
}

// modifiers
const MODIFIERS = {
    DAMAGE_UP : {
        name : "Damage Up",
        sprite : "/sprites/upgrades/dmgUP.png",
        onUse : (letter) => {
            damageIncrease = LETTER_UPGRADE_DAMAGE_INCREASE[letter]
            LETTER_DAMAGE_VALUES[letter] += damageIncrease;
            log(`Increased the base damage of "${letter}" by ${damageIncrease}`);
        }
    },
    PROBABILTY_UP : {
        name : "Probability up",
        sprite : "/sprites/upgrades/TileRateUP.png",
        onUse : (letter) => {
            LETTER_PROBABILITY_POINTS[letter] += 20;
            log(`${letter} is now slighly more likely to appear`);
            Letter.calculateLetterProbabilityThresholds();
        }
    },
    PROBABILITY_DOWN : {
        name : "Probability down",
        sprite : "/sprites/upgrades/TileRateDown.png",
        onUse : (letter) => {
            if (LETTER_PROBABILITY_POINTS[letter] > 40) {
                LETTER_PROBABILITY_POINTS[letter] -= 20;
            } else {
                LETTER_PROBABILITY_POINTS[letter] /= 2;
            }
            log(`${letter} is less likely to appear`);
            Letter.calculateLetterProbabilityThresholds();
        }
    },
    /*REMOVE_LETTER : {
        name : "Remove Letter",
        sprite : "/sprites/upgrades/TileDiscard.png",
        onUse : (letter) => {
            LETTER_PROBABILITY_POINTS[letter] = 0
            log(`${letter} will no longer appear`);
            Letter.calculateLetterProbabilityThresholds();
        }
    }*/
}

class Shop {
    static modifySubmitOnClick(e) {
        let t = $(e.target);
        MODIFIERS[selectedModifier].onUse(selectedLetter);
        if(t.attr("data-return-state")) {
            ui.loadPreviousSceneState(t.attr("data-return-state"));
        } else {
            director.signal("exit-shop");
        }
    }
}