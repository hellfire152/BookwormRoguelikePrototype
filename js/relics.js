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
        // remove currently displayed relics
        $("#owned-relics").empty();
        // re-generate all 
        for(const r of Object.values(this.ownedRelics)) {
            $("#owned-relics").append(r.generateElement());
        }
    }

    addRelic(relicId) {
        if(this.checkHasRelic(relicId)) return false;
        this.ownedRelics[relicId] = RelicFactory.generateRelic(relicId);
        this._updateRelicDisplay();
        return true;
    }

    removeRelic(relicId) {
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
}

class GenericRelic { // for relics that don't need any internal logic
    constructor(data) {
        this.name = data.name;
        this.sprite = data.sprite;
        this.value = data.value;
        this.tooltipDescription = data.tooltipDescription;
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
        }
    }
}
