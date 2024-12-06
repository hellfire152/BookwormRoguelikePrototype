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
            if (gamestate != GAME_CONSTANTS.GAME_STATES.COMBAT) {
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
        name : "Extra Tiles",
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
        sprite : null,
    }
}

function loadItemShop() {
    let shopContainer = $("<div></div>");
    shopContainer.attr("id", "shop-container");

    let shopPrompt = $("<div>");
    shopPrompt.attr("id", "shop-text");
    shopPrompt.text("SHOP");

    let shopItems = $("<div></div>");
    shopItems.attr("id", "shop-items-container");
 
    //generate 3 random relics and 3 random consumables
    let options = [];
    let consumables = _.sampleSize(CONSUMABLE_ID, 3).sort();

    for (const c of consumables) {
        let itemContainer = $("<div></div>");
        itemContainer.addClass("item-container");
        itemContainer.attr("_itemID", c);

        let itemName = $("<div></div>");
        itemName.addClass("item-name");
        itemName.text(CONSUMABLE_DETAILS[c].name);

        let itemSprite = $("<img>");
        itemSprite.attr("src", CONSUMABLE_DETAILS[c].sprite);
        itemSprite.addClass("item-sprite");

        let itemCost = $("<div>");
        itemCost.addClass("item-cost");
        itemCost.text(CONSUMABLE_DETAILS[c].baseCost);

        itemContainer.append(itemName, itemSprite, itemCost);
        shopItems.append(itemContainer);

        options.push({
            "text" : CONSUMABLE_DETAILS[c].name,
            "onSelect" : "purchase-item",
            "args" : `${c}|consumable`
        });
    }

    shopContainer.append(shopPrompt, shopItems);
    sceneStore.event.text = shopContainer;

    options.push({
        "text" : "Continue",
        "onSelect" : "_next-event"
    });
    setEventPlayerOptions(options);
    switchScene(GAME_CONSTANTS.GAME_STATES.EVENT);
}

// modifiers
const MODIFIERS = {
    DAMAGE_UP : {
        name : "Damage Up",
        sprite : null,
        onUse : (letter) => {
            damageIncrease = LETTER_UPGRADE_DAMAGE_INCREASE[letter]
            LETTER_DAMAGE_VALUES[letter] += damageIncrease;
            log(`Increased the base damage of "${letter}" by ${damageIncrease}`);
        }
    },
    PROBABILTY_UP : {
        name : "Probability up",
        sprite : null,
        onUse : (letter) => {
            LETTER_PROBABILITY_POINTS[letter] += 20;
            log(`${letter} is now slighly more likely to appear`);
            calculateLetterProbabilityThresholds();
        }
    },
    PROBABILITY_DOWN : {
        name : "Probability down",
        sprite : null,
        onUse : (letter) => {
            if (LETTER_PROBABILITY_POINTS[letter] > 40) {
                LETTER_PROBABILITY_POINTS[letter] -= 20;
            } else {
                LETTER_PROBABILITY_POINTS[letter] /= 2;
            }
            log(`${letter} is less likely to appear`);
        }
    }
}
function loadUpgradeShop() {
    let shopContainer = $("<div>");
    shopContainer.attr("id", "shop-container")

    let shopPrompt = $("<div></div>");
    shopPrompt.attr("id", "shop-prompt");
    shopPrompt.text("Choose a blessing......");

    let modifiersContainers = $("<div>");
    modifiersContainers.attr("id", "shop-modifiers-container");

    // generate 3 random modifiers
    let modifiers = _.sampleSize(Object.keys(MODIFIERS), 3);
    for (const mod of modifiers) {
        let m = MODIFIERS[mod];
        let modifierContainer = $("<div>");
        modifierContainer.addClass("modifier-container");
        modifierContainer.attr("_modifierid", mod)

        let modifierName = $("<div>");
        modifierName.addClass("modifier-name");
        modifierName.text(m.name);

        let modifierSprite = $("<img>");
        modifierSprite.addClass("modifier-sprite");
        modifierSprite.attr("src", m.sprite);

        modifierContainer.append(modifierName, modifierSprite);
        modifiersContainers.append(modifierContainer);
    }

    shopContainer.append(shopPrompt, modifiersContainers);

    // generate 6 letters to apply the modifiers to
    let letters = _.sampleSize(Letter.ALPHABET_SET, 6);
    let upgradeLetterContainer = $("<div>");
    upgradeLetterContainer.attr("id", "modifier-letter-container");

    for (const l of letters) {  
        let letter = new Letter(l);
        upgradeLetterContainer.append(letter.generateElement());
    }

    // submit modifier
    let submitModifierButton = $("<button>");
    submitModifierButton.attr("id", "modifier-submit");
    submitModifierButton.text("Submit");

    let modifierLetterContainer = $("<div>");
    modifierLetterContainer.attr("id", "modifier-letter-container");
    
    modifierLetterContainer.append(upgradeLetterContainer, submitModifierButton);
    
    sceneStore.event.text = shopContainer;
    sceneStore.event.options = modifierLetterContainer;
    switchScene(GAME_CONSTANTS.GAME_STATES.EVENT);
}

class Shop {
    static modifyLetterOnClick(e) {
        let j = $(e.target);

        // unselect everything else
        let otherLetters = j.siblings();
        otherLetters.attr("data-selected", "false");
        otherLetters.css("border", "")

        // toggle selected
        if (j.attr("data-selected") == "true") {
            j.attr("data-selected", "false");
            j.css("border", "");
            selectedLetter = null;
        } else {
            j.attr("data-selected", "true");
            j.css("border", "5px solid orange");
            selectedLetter = j.text();
        }
    }
    static modifierOnClick(e) {
        let j = $(e.currentTarget);

        // deselect everything else
        let otherModifiers = j.siblings();
        otherModifiers.attr("data-selected", "false");
        otherModifiers.css("border", "");

        // toggle selected
        if (j.attr("data-selected") == "true") {
            j.attr("data-selected", "false");
            j.css("border", "");
            selectedModifier = null;
        } else {
            j.attr("data-selected", "true");
            j.css("border", "5px solid orange");
            selectedModifier = j.attr("_modifierid");
        }
    }
    static modifySubmitOnClick(e) {
        MODIFIERS[selectedModifier].onUse(selectedLetter);
        nextEvent();
    }
}