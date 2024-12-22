class RelicHandler {
    static getRandomRelic(alreadyHave) {
        // remove the relics that are already present
        let commonRelics = {};
        Object.assign(copy, commonRelics);
    
        for(const r in commonRelics) {
            if (alreadyHave.has(commonRelics[r])) {
                commonRelics[r] = undefined;
            }
        }
    
        //random relic from everything left
        let relicKeys = Object.keys(commonRelics);
        return commonRelics[relicKeys[ relicKeys.length * Math.random() << 0 ]];
    }

    
    constructor() {
        this.ownedRelics = {};
    }

    _updateRelicDisplay() {
        UI.Relic.updateDisplay();
    }

    addRelic(relicId) {
        if(this.checkHasRelic(relicId)) return false;
        this.ownedRelics[relicId] = RelicFactory.generateRelic(relicId);
        this.ownedRelics[relicId].onObtain();
        log(`Added relic ${this.ownedRelics[relicId].name} to inventory`);
        this._updateRelicDisplay();
        return true;
    }

    removeRelic(relicId) {
        this.ownedRelics[relicId].onRemove();
        return this.ownedRelics.delete(relicId);
    }

    getOwnedRelics() {
        return this.ownedRelics;
    }

    get ownedRelicsArr() {
        return Object.values(this.ownedRelics);
    }

    checkHasRelic(relicId) {
        return Object.hasOwn(this.ownedRelics, relicId);
    }

    getRelic(relicId) {
        if (this.checkHasRelic(relicId)) {
            return this.ownedRelics[relicId]
        } else return null;
    }
}

const RELIC_ID = {
    // common relics
    RECONSIDER : "R_001",
    CHARISMA : "R_002",
    ACTIONABLE : "R_003",
    HAMMER : "R_004",
    SHINY_HAMMER : "R_005",
    DETERMINATION : "R_006",
    PEN_NIB : "R_007",
    IGNORANCE : "R_008",
    HOLISTIC_EDUCATION : "R_009",
    ALCHEMY_FLASK : "R_010",
    SUPERCALIFRAGILISTICEXPIALIDOCIOUS : "R_011",
    JUST_SAY_NO : "R_012",
    REROLL : "R_013",
    EMPHASIS : "R_014",
    FULL_ASSESSMENT : "R_015",
    AVOWED : "R_016",
    PRETENTIOUS : "R_017",
    MONEY_IS_POWER : "R_018",
    HEAVY_METAL : "R_019",

    // uncommon relics
    FAST_ACTING : "R_300",
    ANTIQUE_CLOCK : "R_301",
    LILY : "R_302",
    PERPETUAL_MOTION_MACHINE : "R_303",
    QUILL : "R_304",
    SPECTACLES : "R|SPECTACLES",
    BASKET : "R_306",
    LENS : "R|LENS",
    SHANK : "R|SHANK",
    SYRINGE : "R|SYRINGE",

    // rare relics
    GAUNTLET : "R|GAUNTLET",
    ANCIENT_TOME : "R|ANCIENT_TOME"
}

class GenericRelic { // for relics that don't need any internal logic
    constructor(data) {
        this.id = data.id;
        this.name = data.name;
        this.sprite = data.sprite;
        this.value = data.value;
        this.tooltipDescription = data.tooltipDescription;
        this.onObtain = data.onObtain || this.onObtain;
        this.onRemove = data.onRemove || this.onRemove;
        this._modifyDisplay = data.modifyDisplay || this._modifyDisplay;
        this._update = data.update || this._update;
    }

    update(data) {
        this._update(this, data);
        UI.Relic.updateSingleRelic(this);
    }
    modifyDisplay(element) {return this._modifyDisplay(this, element)}
    onObtain() {}
    onRemove() {}
    _modifyDisplay(ref, element) {return element;}
    _update(ref, data) {}

    // following methods should really only be defined in child classes
    handleWord(word) {} // this is called on all owned relics after word is submitted
    checkWordBonus(word) {} // checks if word will trigger relic bonus

    generateElement() {
        let relicContainer = $("<div>");
        relicContainer.addClass("relic-container hover-tooltip");
        relicContainer.attr("data-tooltip-content", this.tooltipDescription);
        relicContainer.attr("data-relic-id", this.id)
        let relicSprite = $("<img>");
        relicSprite.addClass("relic-sprite");
        relicSprite.attr("src", this.sprite);
        
        let relicText = $("<div>");
        relicText.addClass("relic-text");
        relicText.text(this.value);

        relicContainer.append(relicSprite, relicText);
        relicContainer = this.modifyDisplay(relicContainer);
        return relicContainer;
    }
}

class PenNibRelic extends GenericRelic {
    constructor() {
        super({
            id : RELIC_ID.PEN_NIB,
            name : "Pen nib",
            sprite : "./sprites/relics/PenNib.png",
            update : (ref) => {
                this.value++;
            },
            modifyDisplay : (ref, element) => {
                if (this.value == this.ACTIVE_THRESHOLD) {
                    element.addClass("relic-active-highlight");
                }
                return element;
            }
        });
        this.tooltipDescription = `Every ${this.ACTIVE_THRESHOLD} attacks, double the damage.`
        this.value = 1;
    }

    ACTIVE_THRESHOLD = 6

    handleWord(word) {
        this.update(); // add counter by one every time a word is played
    }
    get isActive() {
        return this.value > this.ACTIVE_THRESHOLD;
    }
    reset() {
        this.value = 1;
        UI.Relic.updateSingleRelic(this);
    }
}

class RelicFactory {
    static generateRelic(relicId) {
        switch(relicId) {
            case RELIC_ID.HEAVY_METAL : {
                return new GenericRelic({
                    id : relicId,
                    name : "Heavy Metal",
                    sprite : "./sprites/relics/Poison.png",
                    tooltipDescription : "Gems now deal a portion of the word's damage as additional poison damage.\n Purple -> 0.3x, Blue -> 0.5x"
                });
            }
            case RELIC_ID.ANTIQUE_CLOCK : {
                return new GenericRelic({
                    id : relicId,
                    name : "Lived in the Past",
                    sprite : "./sprites/relics/AntiqueClock.png",
                    tooltipDescription : "\"ED\" tiles have a chance to spawn",
                    onObtain : () => {
                        LETTER_PROBABILITY_POINTS["ed"] = 10;
                        Letter.calculateLetterProbabilityThresholds(); 
                    }
                });
            }
            case RELIC_ID.LILY : {
                return new GenericRelic({
                    id : relicId,
                    name : "Lily",
                    sprite : "./sprites/relics/Lily.png",
                    tooltipDescription : "\"LY\" tiles have a chance to spawn",
                    onObtain : () => {
                        LETTER_PROBABILITY_POINTS["ly"] = 10;
                        Letter.calculateLetterProbabilityThresholds();
                    }
                })
            }
            case RELIC_ID.PERPETUAL_MOTION_MACHINE : {
                return new GenericRelic({
                    id : relicId,
                    name : "Perpetual Motion Machine",
                    sprite : "./sprites/relics/PerpetualMotionMachine.png",
                    tooltipDescription : "\"ING\" tiles have a chance to spawn",
                    onObtain : () => {
                        LETTER_PROBABILITY_POINTS["ing"] = 10;
                        Letter.calculateLetterProbabilityThresholds();
                    },
                    onRemove : () => {
                        delete LETTER_PROBABILITY_POINTS["ing"];
                        Letter.calculateLetterProbabilityThresholds();
                    }
                });
            }
            case RELIC_ID.QUILL : {
                return new GenericRelic({
                    id : relicId,
                    name : "Quill",
                    sprite : "./sprites/relics/Lily.png",
                    tooltipDescription : "\"Q\" tiles are replaced with \"QU\" tiles instead",
                    onObtain : () => {
                        LETTER_PROBABILITY_POINTS["qu"] = LETTER_PROBABILITY_POINTS["q"];
                        delete LETTER_PROBABILITY_POINTS["q"];
                        Letter.calculateLetterProbabilityThresholds();
                    },
                    onRemove : () => {
                        LETTER_PROBABILITY_POINTS["q"] = LETTER_PROBABILITY_POINTS["qu"];
                        delete LETTER_PROBABILITY_POINTS["qu"];
                        Letter.calculateLetterProbabilityThresholds();
                    }
                })
            }
            case RELIC_ID.SPECTACLES : {
                return new GenericRelic({
                    id : relicId,
                    name : "Empty Headed",
                    sprite : "./sprites/relics/Specs.png",
                    tooltipDescription : "Blank tiles now have a low chance to spawn",
                    onObtain : () => {
                        LETTER_PROBABILITY_POINTS["?"] = 5;
                        Letter.calculateLetterProbabilityThresholds();
                    },
                    onRemove : () => {
                        delete LETTER_PROBABILITY_POINTS["?"];
                        Letter.calculateLetterProbabilityThresholds();
                    }
                })
            }
            case RELIC_ID.BASKET : {
                return new GenericRelic({
                    id : relicId,
                    name : "Extra Tile",
                    sprite : "./sprites/relics/Basket.png",
                    tooltipDescription : "+1 Max Tiles",
                    onObtain : () => {
                        GAME_CONSTANTS.STARTING_LETTER_COUNT += 1;
                        Letter.generateLetters();
                    },
                    onRemove : () => {
                        GAME_CONSTANTS.STARTING_LETTER_COUNT -= 1;
                    }
                })
            }
            case RELIC_ID.GAUNTLET : {
                return new GenericRelic({
                    id : relicId,
                    name : "Gauntlet",
                    sprite : "./sprites/relics/Gauntlet.png",
                    tooltipDescription : "Max tiles +3, but you gain half the amount of charge",
                    onObtain : () => {
                        GAME_CONSTANTS.STARTING_LETTER_COUNT += 3;
                        Letter.generateLetters();
                    },
                    onRemove : () => {
                        GAME_CONSTANTS.STARTING_LETTER_COUNT -= 3;
                    }
                })
            }
            case RELIC_ID.SHANK : {
                return new GenericRelic({
                    id : relicId,
                    name : "Shank",
                    sprite : "./sprites/relics/Shank.png",
                    tooltipDescription : "Words < 5 in length give charge as if they were 5 characters long",
                });
            }
            case RELIC_ID.LENS : {
                return new GenericRelic({
                    id : relicId,
                    name : "Lens",
                    sprite : "./sprites/relics/Lens.png",
                    tooltipDescription : "Gems give more charge when played"
                });
            }
            case RELIC_ID.ANCIENT_TOME : {
                return new GenericRelic({
                    id : relicId,
                    name : "Ancient Tome",
                    sprite : null,
                    tooltipDescription : "Charge Gain x2, but Max Tiles - 2",
                    onObtain : () => {
                        GAME_CONSTANTS.STARTING_LETTER_COUNT -= 2;
                    },
                    onRemove : () => {
                        GAME_CONSTANTS.STARTING_LETTER_COUNT += 2;
                    }
                })
            }
            case RELIC_ID.SYRINGE : {
                let r = new GenericRelic({
                    id : relicId,
                    name : "Syringe",
                    sprite : "./sprites/relics/srynge.png",
                    tooltipDescription : "The first charge ability per combat costs half",
                    update : (ref, isActive) => {
                        ref.isActive = isActive;
                        UI.Ability.updateDisplay(player);
                    },
                    modifyDisplay : (ref, element) => {
                        if (ref.isActive) {
                            element.addClass("relic-active-highlight");
                        }
                        return element;
                    }
                });
                r.isActive = true;
                return r;
            }
            case RELIC_ID.PEN_NIB : {
                return new PenNibRelic();
            }
            default : {
                throw new Error("No relic found! Did you forget to add it to the Factory class?")
            }
        }
    }
}
