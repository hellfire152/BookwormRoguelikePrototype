const CONSUMABLE_ID = {
    HEALING_POTION : 0, //heals for a set amount of HP
    MOLOTOV : 1, // deals a set amount of damage
    SINGLE_TILE_REROLL : 2, // rerolls a single tile
    INSTANT_REFRESH : 3, // rerolls all tiles without skipping a turn
    NEW_KNOWLEDGE : 4, // adds a set number of extra tiles
    OMNISCIENCE : 5, // plays the longest possible word for you
}

const CONSUMABLE_DETAILS = {
    0 : {
        name : "Healing potion",
        onUse : () => {
            player.healDamage(10);
        },
        baseCost : 30,
        sprite : null,
    },
    1 : {
        name : "Molotov Cocktail",
        onUse : () => {
            if (currentEnemy) {
                currentEnemy.dealDamage(20);
                log(`Dealt 20 damage to ${currentEnemy.name}!`);
                return true;
            }
            return false;
        },
        baseCost : 30,
        sprite : null,
    },
    2 : {
        name : "Single Tile Reroll",
        onUse : () => {
           console.log("Unimplemented"); 
        },
        baseCost : 20,
        sprite : null,
    },
    3 : {
        name : "Instant Full Refresh",
        onUse : () => {
            console.log("Unimplemented");
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
    let consumables = _.sampleSize(CONSUMABLE_ID, 3);

    for (const c in consumables) {
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
            LETTER_DAMAGE_VALUES[letter] += 1;
            log(`Increased the base damage of "${letter}" by 1`);
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