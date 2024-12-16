const ABILITY_ID = {
    GIVE_VULNERABILITY : "A|GIVE_VULNERABILITY",
    GIVE_WEAKNESS : "A|GIVE_WEAKNESS",
    REROLL_TILE : "A|REROLL_TILE",
    EXTRA_TILE : "A|EXTRA_TILE",
    NEXT_LETTER : "A|NEXT_LETTER",
    PREVIOUS_LETTER : "A|PREVIOUS_LETTER",
    DAMAGE_BOOST : "A|DAMAGE_BOOST"
}

class AbilityFactory {
    static generateAbility(abilityId) {
        switch(abilityId) {
            case ABILITY_ID.GIVE_VULNERABILITY : {
                let a = new Ability({
                    id : ABILITY_ID.GIVE_VULNERABILITY,
                    cost : 5,
                    name : "Give Vulnerability",
                    sprite : "./sprites/effects/Questionmorks.png",
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
                    sprite : "./sprites/effects/Questionmorks.png",
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
                    sprite : "./sprites/effects/Questionmorks.png",
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
                    sprite : "./sprites/effects/Questionmorks.png",
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
                    cost : 5,
                    name : "Next Letter",
                    sprite : "./sprites/effects/Questionmorks.png",
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
                    cost : 5,
                    name : "Next Letter",
                    sprite : "./sprites/effects/Questionmorks.png",
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
                    sprite : "./sprites/effects/Questionmorks.png",
                    tooltip : "Your next attack deals 1.5x more damage (stacks additively)"
                });
                a.use = () => {
                    if (!director.isInCombat) return false;
                    player.applyEffect(Effect.EFFECT_TYPES.DAMAGE_BOOST, 1.5);
                    return true;
                }
                return a;
            }
        }
    }
}

class Ability {
    static removeAbilitySubmitOnClick(e) {
        let abilityId = UI.Ability.getAbilityIdFromOnclick(e);
        player.removeAbility(abilityId);
        ui.loadPreviousSceneState(GAME_CONSTANTS.GAME_STATES.EVENT);
    }
    static abilityOnClick(e) {
        let abilityId = UI.Ability.getAbilityIdFromOnclick(e);
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
    
    generateElement() {
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

        abilityContainer.append(abilitySprite, abilityText);
        return abilityContainer;
    }
}