const ABILITY_ID = {
    GIVE_VULNERABILITY : "A|GIVE_VULNERABILITY",
    GIVE_WEAKNESS : "A|GIVE_WEAKNESS",
    REROLL_TILE : "A|REROLL_TILE",
    EXTRA_TILE : "A|EXTRA_TILE",
    NEXT_LETTER : "A|NEXT_LETTER",
    PREVIOUS_LETTER : "A|PREVIOUS_LETTER",
    DAMAGE_BOOST : "A|DAMAGE_BOOST",
    MAKE_TILE_POISONOUS : "A|MAKE_TILE_POISONOUS",
    OMNISCIENCE : "A|OMNISCIENCE"
}

class AbilityFactory {
    static generateAbility(abilityId) {
        switch(abilityId) {
            case ABILITY_ID.GIVE_VULNERABILITY : {
                let a = new Ability({
                    id : ABILITY_ID.GIVE_VULNERABILITY,
                    cost : 5,
                    name : "Give Vulnerability",
                    sprite : "./sprites/abilities/Vulnerability.png",
                    tooltip : "Makes enemies vulnerable for one turn (does not stack)"
                });
                a.use = () => {
                    if (!director.isInCombat) return false;
                    currentEnemy.applyEffect(Effect.EFFECT_TYPES.VULNERABLE, 1);
                    return true;
                }
                return a;
            }
            case ABILITY_ID.GIVE_WEAKNESS : {
                let a = new Ability({
                    id : ABILITY_ID.GIVE_WEAKNESS,
                    cost : 5,
                    name : "Give Weakness", 
                    sprite : "./sprites/abilities/Weakness.png",
                    tooltip : "Gives enemies Weakness for one turn (does not stack)"
                });
                a.use = () => {
                    if (!director.isInCombat) return false;
                    currentEnemy.applyEffect(Effect.EFFECT_TYPES.WEAKNESS, 1)
                    return true;
                }
                return a;
            }
            case ABILITY_ID.REROLL_TILE : {
                let a = new Ability({
                    id : ABILITY_ID.REROLL_TILE,
                    cost : 5,
                    name : "Reroll Tile",
                    sprite : "./sprites/abilities/Reroll.png",
                    tooltip : "Reroll a single tile"
                });
                a.use = () => {
                    if (!director.isInCombat) return false;

                    UI.Letter.temporaryTileHighlightWithCallback((t, letter) => {
                        letter.rerollLetter(t);
                    }, "temporary-highlight-ability");
                    return true;
                }
                return a;
            }
            case ABILITY_ID.EXTRA_TILE : {
                let a = new Ability({
                    id : ABILITY_ID.EXTRA_TILE,
                    cost : 5,
                    name : "Generate Tile",
                    sprite : "./sprites/abilities/ExtraTile.png",
                    tooltip : "Generates an extra tile"
                });
                a.use = () => {
                    if (!director.isInCombat) return false;
                    Letter.generateLetters(1);
                    return true;
                }
                return a;
            }
            case ABILITY_ID.NEXT_LETTER : {
                let a = new Ability({
                    id : ABILITY_ID.NEXT_LETTER,
                    cost : 2,
                    name : "Next Letter",
                    sprite : "./sprites/abilities/NextLetter.png",
                    tooltip : "Changes a tile to the next letter"
                });
                a.use = () => {
                    if (!director.isInCombat) return false;
                    UI.Letter.temporaryTileHighlightWithCallback((t, letter) => {
                        let l = letter.letter;
                        let newLetterIndex = Letter.ALPHABET_SET.indexOf(l) + 1;
                        if (newLetterIndex >= Letter.ALPHABET_SET.length) {
                            newLetterIndex = 0;
                        }
                        letter.replaceLetter(t, Letter.ALPHABET_SET[newLetterIndex])
                    }, "temporary-highlight-ability");
                    return true;
                }
                return a;
            }
            case ABILITY_ID.PREVIOUS_LETTER : {
                let a = new Ability({
                    id : ABILITY_ID.PREVIOUS_LETTER,
                    cost : 2,
                    name : "Next Letter",
                    sprite : "./sprites/abilities/PrevLetter.png",
                    tooltip : "Changes a tile to the next letter"
                });
                a.use = () => {
                    if (!director.isInCombat) return false;
                    UI.Letter.temporaryTileHighlightWithCallback((t, letter) => {
                        let l = letter.letter;
                        let newLetterIndex = Letter.ALPHABET_SET.indexOf(l) - 1;
                        if (newLetterIndex < 0) {
                            newLetterIndex = Letter.ALPHABET_SET.length - 1;
                        }
                        letter.replaceLetter(t, Letter.ALPHABET_SET[newLetterIndex])
                    }, "temporary-highlight-ability");
                    return true;
                }
                return a;
            }
            case ABILITY_ID.DAMAGE_BOOST : {
                let a = new Ability({
                    id : ABILITY_ID.DAMAGE_BOOST,
                    cost : 10,
                    name : "Damage Boost",
                    sprite : "./sprites/abilities/dmgUP.png",
                    tooltip : "Your next attack deals 1.5x more damage (stacks additively)"
                });
                a.use = () => {
                    if (!director.isInCombat) return false;
                    player.applyEffect(Effect.EFFECT_TYPES.DAMAGE_BOOST, 1.5);
                    return true;
                }
                return a;
            }
            case ABILITY_ID.MAKE_TILE_POISONOUS : {
                let a = new Ability({
                    id : ABILITY_ID.MAKE_TILE_POISONOUS,
                    cost : 5,
                    name : "Poison Tile",
                    sprite : "./sprites/abilities/Poison.png",
                    tooltip : "Makes the selected tile poisonous"
                });
                a.use = () => {
                    if (!director.isInCombat) return false;
                    UI.Letter.temporaryTileHighlightWithCallback((t, letter) => {
                        letter.applyTileEffect(t, TILE_EFFECTS.POISONOUS, {duration : 3})
                    }, "temporary-highlight-ability")
                    return true;
                }
                return a;
            }
            case ABILITY_ID.OMNISCIENCE : {
                let a = new Ability({
                    id : ABILITY_ID.OMNISCIENCE,
                    cost : 10,
                    name : "Search",
                    sprite : "./sprites/abilities/Search.png",
                    tooltip : "Finds the longest word."
                });
                a.use = () => {
                    if (!director.isInCombat) return false;

                    UI.Letter.unselectAllLetters();
                    let letterObjects = UI.Letter.getAvailableLetterObjects();
                    let result = Utils.findLongestWord(letterObjects);

                    // now figure out how to actually play the word
                    // NOTE: Not implementing this, too hard for not much point
                    //let ordered = _.orderBy(letterObjects, [(l) => {return l.letter.length}], 'desc');
                    
                    log(`Longest word is: ${result}`);
                    return true;
                }
                return a;
            }
            default : {
                throw new Error(`Ability ${abilityId} does not exist!`);
            }
        }
    }

    static getRandomUnownedAbilities(amount) {
        let abilities = [];
        while(abilities.length < amount) {
            let abilityId = _.sample(Object.values(ABILITY_ID));
            if (!player.getChargeAbility(abilityId)) {
                abilities.push(abilityId);
            }
        }
        abilities = abilities.map((abilityId) => {
            return AbilityFactory.generateAbility(abilityId);
        })
        return abilities;
    }
}

class Ability {
    static abilityOverflowSubmitOnClick(e) {
        let j = $(e.currentTarget);
        player.removeAbility(selectedAbility);
        let state = j.attr("data-return-state") || GAME_CONSTANTS.GAME_STATES.EVENT;
        ui.loadPreviousSceneState(state);
    }
    static abilityOnClick(e) {
        let abilityId = UI.Ability.getAbilityIdFromOnclick(e);
        let chargeHealRelic = relicHandler.getRelic(RELIC_ID.T_CHARGE_HEAL);
        console.log(chargeHealRelic)
        if (chargeHealRelic) {
            let ability = player.getChargeAbility(abilityId);
            if (!ability) throw new Error(`Player does not have ability of ability id ${abilityId}`);
            chargeHealRelic.update(ability.cost)
        }
        player.useChargeAbility(abilityId);
    }

    constructor(data) {
        this.cost = data.cost;
        this.name = data.name;
        this.sprite = data.sprite;
        this.tooltip = data.tooltip;
        this.id = data.id;
    }

    use() {console.log("unimplemented")} // implement separately for each ability
    
    generateElement(showCost = true) {
        // reset cost
        if (this._cost) this.cost = this._cost;
        
        let abilityContainer = $("<div>");
        abilityContainer.addClass("ability-container");
        abilityContainer.attr("data-ability-id", this.id);

        let abilitySprite = $("<img>");
        abilitySprite.attr("src", this.sprite);
        abilitySprite.addClass("ability-sprite hover-tooltip");
        abilitySprite.attr("data-tooltip-content", this.tooltip);

        let abilityText = $("<div>");
        abilityText.text(this.cost);
        abilityText.addClass("ability-text");

        // relics
        if (relicHandler.checkHasRelic(RELIC_ID.SYRINGE)
         && relicHandler.getRelic(RELIC_ID.SYRINGE).isActive) {
            this._cost = this.cost;
            this.cost /= 2;
            abilityText.text(this.cost);
            abilityText.addClass("ability-text-discount-highlight")
        }

        abilityContainer.append(abilitySprite);
        if (showCost) abilityContainer.append(abilityText);
        return abilityContainer;
    }
}