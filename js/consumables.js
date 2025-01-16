const CONSUMABLE_ID = {
    HEALING_POTION : "C|HEALING_POTION", //heals for a set amount of HP
    THROWING_KNIVES : "C|THROWING_KNIVES", // deals a set amount of damage
    SINGLE_TILE_REROLL : "C|SINGLE_TILE_REROLL", // rerolls a single tile
    INSTANT_REFRESH : "C|INSTANT_REFRESH", // rerolls all tiles without skipping a turn
    TILE_DELIVERY : "C|TILE_DELIVERY", // adds a set number of extra tiles
    //OMNISCIENCE : 5, // plays the longest possible word for you
    SCROLL : "C|SCROLL", // gives a set amount of charge
    PORTABLE_CHARGER : "C|PORTABLE_CHARGER",
    VOICE_RECORDER : "C|VOICE_RECORDER",
    CLEANSING_POTION : "C|CLEANSING_POTION"
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
                    sprite : "./sprites/consumables/Potion.png",
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
                    sprite : "./sprites/consumables/Knife1.png",
                    tooltip : "Deals 20 Damage to the current enemy"
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
                    sprite : "./sprites/consumables/RerollTile.png",
                    tooltip : "Rerolls a single tile"
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
                    sprite : "./sprites/consumables/ClearTile.png",
                    tooltip : "Rerolls all letters"
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
                    sprite : "./sprites/consumables/Donki.png",
                    tooltip : "Give you 3 extra temporary tiles"
                });
            }
            case CONSUMABLE_ID.SCROLL : {
                return new Consumable({
                    id : CONSUMABLE_ID.SCROLL,
                    name : "Scroll",
                    use : () => {
                        player.gainCharge(15);
                        return true;
                    },
                    baseCost : 20,
                    sprite : "./sprites/Questionmorks.png",
                    tooltip : "Gives 15 Charge"
                })
            }
            case CONSUMABLE_ID.PORTABLE_CHARGER : {
                return new Consumable({
                    id : CONSUMABLE_ID.PORTABLE_CHARGER,
                    name : "Portable Charger",
                    use : () => {
                        let letters = UI.Letter.getLetterObjects();
                        for (const l of letters) {
                            l.applyTileEffect(TILE_EFFECTS.SUPERCHARGED, {duration:1})
                        }
                        return true;
                    },
                    baseCost : 70,
                    sprite : "./sprites/Questionmorks.png",
                    tooltip : "Gives all current tiles Supercharge for 1 turn"
                })
            }
            case CONSUMABLE_ID.VOICE_RECORDER : {
                return new Consumable({
                    id : CONSUMABLE_ID.VOICE_RECORDER,
                    name : "Voice Recorder",
                    use : () => {
                        let letters = UI.Letter.getLetterObjects();
                        for (const l of letters) {
                            l.applyTileEffect(TILE_EFFECTS.STUTTER, {duration: 1});
                        }
                        return true;
                    },
                    baseCost : 40,
                    sprite : "./sprites/Questionmorks.png",
                    tooltip : "Gives all tiles Stutter for 1 turn"
                })
            }
            case CONSUMABLE_ID.CLEANSING_POTION : {
                return new Consumable({
                    id : CONSUMABLE_ID.CLEANSING_POTION,
                    name : "Cleansing Potion",
                    use : () => {
                        player.cleanseTileAndStatus();
                        return true;
                    },
                    baseCost : 50,
                    sprite : "./sprites/Questionmorks.png",
                    tooltip : "Cleanse all tile and status debuffs"
                })
            }
        }
    }
}

