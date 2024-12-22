const COMPANION_ID = {
    CAT : "C|CAT"
}

class Companion {
    static generateCompanion(companionId) {
        switch(companionId) {
            case COMPANION_ID.CAT : {
                return new CatCompanion();
            }
            default : {
                throw new Error("Companion ID does not exist! Check the companion Factory")
            }
        }
    }   
    
    constructor(data) {
        this.maxCount = data.maxCount || 5;
        this.currentCount = data.currentCount || 0;
        this.sprite = data.sprite;
        this.id = data.id;
        this.name = data.name;
        this.tooltip = data.tooltip;
    }
    resolveSubmitWord(word) { // can change this behaviour in child classes
        let toAdvance = 1; 
        if (this.isBonusWord(word)) {
            toAdvance += 1;
        }
        this.advanceCounter(toAdvance);
    } 
    isBonusWord(word) {} // define in child classes
    advanceCounter(value) {
        if (value) {
            this.currentCount += value; // allow overflow
        }
        else {
            this.currentCount++;
        }
        if (director.isInCombat) {
            while(this.isReady) {
                this.resolveAttack();
            }
        }
        this._updateCompanionDisplay();
        // companion attacks will be checked post turn, no need to do it here
    }

    get isReady() {
        return this.currentCount >= this.maxCount;
    }

    get counterPercent() {
        return Math.round(this.currentCount / this.maxCount * 100);
    }

    resolveAttack() {
        let companionAttack = this.getAttackResult();
        for (const e of companionAttack.effects) {
            e.apply(e, this.name);
        }
        this.currentCount -= this.maxCount;
        this._updateCompanionDisplay();
    }

    _updateCompanionDisplay() {
        UI.Companion.updateSingleCompanion(this);
    }

    generateElement() {
        let companionContainer = $("<div><div>");
        companionContainer.addClass("companion-container hover-tooltip");
        companionContainer.attr("data-companion-id", this.id);
        companionContainer.attr("data-tooltip-content", this.tooltip);

        let companionCounter = $("<div></div>");
        companionCounter.addClass("companion-counter-max");

        let companionCurrentCounter = $("<div></div>");
        companionCurrentCounter.addClass("companion-counter-current");
        companionCurrentCounter.css("width", `${this.counterPercent}%`);

        let companionCounterText = $("<div></div>");
        companionCounterText.addClass("companion-counter-text");
        companionCounterText.text(`${this.currentCount} / ${this.maxCount}`);

        let companionSprite = $("<img>");
        companionSprite.addClass("companion-sprite");
        companionSprite.attr("src", this.sprite);
        
        let companionName = $(`<div>${this.name}</div>`);
        companionName.addClass("companion-name")

        companionCounter.append(companionCounterText, companionCurrentCounter);
        companionContainer.append(companionCounter, companionSprite, companionName);

        return companionContainer;
    }
}

class CatCompanion extends Companion {
    constructor(data) {
        super({
            maxCount : 3,
            sprite : "./sprites/companions/cat.png",
            id : COMPANION_ID.CAT,
            name : "Cat",
            tooltip : "When you play a word, advance 1.\nWhen you play a verb, advance 1 more."
        });
    }

    // extend this for different attacks. Not doing the attack here directly as the result
    // may be altered by different relic / ability effects
    getAttackResult() {
        let effects = [AttackEffect.damageEffect("enemy", 5)];
        return {
            effects
        }
    }

    isBonusWord(word) {
        return wordlist[word]["types"].includes("verb");
    }
}

class CompanionHandler {
    constructor() {
        this.companions = {};
    }

    get companionArr() {
        return Object.values(this.companions);
    }

    getCompanion(companionId) {
        if (Object.hasOwn(this.companions, companionId)) {
            return this.companions[companionId];
        }
        return null;
    }

    addCompanion(companionId) {
        if (Object.hasOwn(this.companions, companionId)) {
            return false;
        }
        this.companions[companionId] = Companion.generateCompanion(companionId);
        UI.Companion.updateDisplay(this.companions);
        return true;
    }

    removeCompanion(companionId) {
        if (Object.hasOwn(this.companions, companionId)) {
            delete this.companions[companionId];
            UI.Companion.updateDisplay(this.companions);
            return true;
        }
        return false;
    }
}