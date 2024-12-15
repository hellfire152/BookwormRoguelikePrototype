const CONSUMABLE_ID = {
    HEALING_POTION : "C|HEALING_POTION", //heals for a set amount of HP
    THROWING_KNIVES : "C|THROWING_KNIVES", // deals a set amount of damage
    SINGLE_TILE_REROLL : "C|SINGLE_TILE_REROLL", // rerolls a single tile
    INSTANT_REFRESH : "C|INSTANT_REFRESH", // rerolls all tiles without skipping a turn
    TILE_DELIVERY : "C|TILE_DELIVERY", // adds a set number of extra tiles
    //OMNISCIENCE : 5, // plays the longest possible word for you
}

class Consumable {
    constructor(data) {
        this.id = data.id;
        this.name = data.name;
        this.baseCost = data.baseCost;
        this.sprite = data.sprite;
        this.use = data.use;
        this.tooltip = data.tooltip;
    }

    use() {console.log("unimplemented")}

    generateElement(shopDisplay = false, index) {
        let itemContainer = $("<div></div>");

        let itemSprite = $("<img>");
        itemSprite.attr("src", this.sprite);
        itemSprite.addClass("hover-tooltip");
        itemSprite.attr("data-tooltip-content", this.tooltip);
        
        let itemName;
        let itemCost;
        if (shopDisplay) { // for display in shop
            itemCost = $("<div>");
            itemCost.addClass("item-cost");
            itemCost.text(this.baseCost);
            itemName = $("<div></div>");
            itemName.addClass("item-name");
            itemName.text(this.name);

            itemContainer.addClass("item-container");
            itemSprite.addClass("item-sprite");

            itemContainer.attr("_itemID", this.id);
        } else { // for player inventory
            itemContainer.attr("data-c-index", index);
            itemContainer.addClass("player-consumable");
            itemSprite.addClass("player-consumable-sprite");
        }

        itemContainer.append(itemName, itemSprite, itemCost);
        return itemContainer;
    }
}

class ConsumableFactory {
    static generateConsumable(consumableId) {
        switch(consumableId) {
            case CONSUMABLE_ID.HEALING_POTION : {
                return new Consumable({
                    id : CONSUMABLE_ID.HEALING_POTION,
                    name : "Healing potion",
                    use : () => {
                        player.healDamage(10);
                        log("Healed 10 HP!");
                        return true;
                    },
                    baseCost : 30,
                    sprite : "/sprites/consumables/Potion.png",
                    tooltip : "Heals for 10 HP"
                });
            }
            case CONSUMABLE_ID.THROWING_KNIVES : {
                return new Consumable({
                    id : CONSUMABLE_ID.THROWING_KNIVES,
                    name : "Throwing Knives",
                    use : () => {
                        if (currentEnemy.isAlive) {
                            currentEnemy.dealDamage(20);
                            log(`Dealt 20 damage to ${currentEnemy.name}!`);
                            return true;
                        }
                        log("No enemy to deal damage to!");
                        return false;
                    },
                    baseCost : 30,
                    sprite : "/sprites/consumables/Knife1.png",
                });
            }
            case CONSUMABLE_ID.SINGLE_TILE_REROLL : {
                return new Consumable({
                    id : CONSUMABLE_ID.SINGLE_TILE_REROLL,
                    name : "Single Tile Reroll",
                    use : () => {
                        if (!director.isInCombat || !currentEnemy.isAlive) {
                            log("Can only be used in combat!");
                            return false;
                        }
                        // highlight all letters
                        UI.Letter.temporaryTileHighlightWithCallback((t, letter) => {
                            letter.rerollLetter(t);
                            log("Rerolled a single tile");
                        });
                        return true;
                    },
                    baseCost : 20,
                    sprite : "/sprites/consumables/RerollTile.png",
                });
            }
            case CONSUMABLE_ID.INSTANT_REFRESH : {
                return new Consumable({
                    id : CONSUMABLE_ID.INSTANT_REFRESH,
                    name : "Instant Full Refresh",
                    use : () => {
                        if (director.isInCombat && currentEnemy.isAlive) {
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
                });
            }
            case CONSUMABLE_ID.TILE_DELIVERY : {
                return new Consumable({
                    id : CONSUMABLE_ID.TILE_DELIVERY,
                    name : "Tile Delivery",
                    use : () => {
                        if (director.isInCombat && currentEnemy.isAlive) {
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
                });
            }
        }
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
