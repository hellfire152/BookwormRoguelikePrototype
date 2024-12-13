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

    checkHasRelic(relicId) {
        return Object.hasOwn(this.ownedRelics, relicId);
    }

    triggerRelicIfOwned(relicId) {
        if(Object.hasOwn(this.ownedRelics, relicId)) {
            this.ownedRelics[relicId].triggerUpdate();
        }
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
    LIVED_IN_THE_PAST : "R_301",
    ADVERBLY : "R_302",
    PERPETUAL_MOTION_MACHINE : "R_303",
    EXTRACT_QI : "R_304"
}

class GenericRelic { // for relics that don't need any internal logic
    constructor(data) {
        this.name = data.name;
        this.sprite = data.sprite;
        this.value = data.value;
        this.tooltipDescription = data.tooltipDescription;
        this.onObtain = data.onObtain;
        this.onRemove = data.onRemove;
    }

    triggerUpdate(data) {} // for child classes to implement other logic

    generateElement() {
        let relicContainer = $("<div>");
        relicContainer.addClass("relic-container hover-tooltip");
        relicContainer.attr("data-tooltip-content", this.tooltipDescription);

        let relicSprite = $("<div>");
        relicSprite.addClass("relic-sprite");
        relicSprite.attr("src", this.sprite);
        
        let relicText = $("<div>");
        relicText.addClass("relic-text");
        relicText.text(this.value);

        relicContainer.append(relicSprite, relicText);
        return relicContainer;
    }
}

class RelicFactory {
    static generateRelic(relicId) {
        switch(relicId) {
            case RELIC_ID.HEAVY_METAL : {
                return new GenericRelic({
                    name : "Heavy Metal",
                    sprite : null,
                    tooltipDescription : "Gems now deal a portion of the word's damage as additional poison damage.\n Purple -> 0.3x, Blue -> 0.5x"
                });
            }
            case RELIC_ID.LIVED_IN_THE_PAST : {
                return new GenericRelic({
                    name : "Lived in the Past",
                    sprite : null,
                    tooltipDescription : "\"ED\" tiles have a chance to spawn",
                    onObtain : () => {
                        LETTER_PROBABILITY_POINTS["ed"] = 10;
                        Letter.calculateLetterProbabilityThresholds(); 
                    }
                });
            }
            case RELIC_ID.ADVERBLY : {
                return new GenericRelic({
                    name : "Adverbly",
                    sprite : null,
                    tooltipDescription : "\"LY\" tiles have a chance to spawn",
                    onObtain : () => {
                        LETTER_PROBABILITY_POINTS["ly"] = 10;
                        Letter.calculateLetterProbabilityThresholds();
                    }
                })
            }
            case RELIC_ID.PERPETUAL_MOTION_MACHINE : {
                return new GenericRelic({
                    name : "Perpetual Motion Machine",
                    sprite : null,
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
            case RELIC_ID.EXTRACT_QI : {
                return new GenericRelic({
                    name : "Extract Qi",
                    sprite : null,
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

        }
    }
}
