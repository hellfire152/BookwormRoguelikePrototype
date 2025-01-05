class Player extends Character {
    constructor() {
        super();
        this._money = 0;
        this.items = [];
        this.flags = {};
        this.maxHP = 100;
        this.currentHP = this.maxHP;
        this.currentCharge = 0;
        this.maxCharge = 100;
        this.chargeAbilities = [];
        this.consumables = [];
    }

    attemptPurchase(itemID, itemType) {
        if (itemType == "consumable") {
            let consumable = ConsumableFactory.generateConsumable(itemID);
            if (this.money < consumable.baseCost) {
                log(`Insufficient Money for ${consumable.name}!`);
                return false;
            } else if (this.consumables.length >= 5) {
                log(`Consumable inventory is full!`);
                return false;
            } else {
                this.money -= consumable.baseCost;
                this.consumables.push(consumable);
                UI.Player.updateConsumableDisplay(this);
                log(`Puchased ${consumable.name} for ${consumable.baseCost} Money!`);
                return true;
            }
        } else if (itemType == "relic") {
            let relic = RelicFactory.generateRelic(itemID);
            if (this.money < relic.shopCost) {
                log(`Insufficient Money for ${relic.name}`);
                return false;
            } else {
                this.money -= relic.shopCost;
                relicHandler.addRelic(itemID);
                return true;
            }
        }
        return false;
    }

    giveConsumable(itemID) {
        let consumable = ConsumableFactory.generateConsumable(itemID);
        this.consumables.push(consumable);
        UI.Player.updateConsumableDisplay(this);
        log(`Added ${consumable.name} to inventory`);
    }

    _updateHPDisplay() {
        UI.Player.updateHPDisplay(this);
    }
    _updateEffectDisplay() {
        UI.Player.updateStatusDisplay(this.getStatuses());
    }
    _updateChargeDisplay() {
        UI.Player.updateChargeDisplay(this);
    }
    _updateMoneyDisplay() {
        UI.Player.updateMoneyDisplay(this._money);
    }

    giveMoney(amountGiven) {
        this.money += parseInt(amountGiven);
    }

    get money() {
        return this._money;
    }
    set money(money) {
        this._money = money;
        this._updateMoneyDisplay();
    }

    checkFlag(flag) {
        return !!this.flags[flag]
    }

    setFlag(flag) {
        this.flags[flag] = true;
    }

    dealDamage(damage) {
        let result = super.dealDamage(damage);
        Anim.playerReciveDamage(damage);
        if (!this.isAlive) {
            alert(`Game Over! You lasted ${levelsCleared} rounds.`);
        }
        return false;
    }

    gainCharge(charge) {
        this.currentCharge += charge;
        if (this.currentCharge > this.maxCharge) {
            this.currentCharge = this.maxCharge;
        }
        Anim.playerChargeGained(charge);
        this._updateChargeDisplay();
    }

    removeCharge(charge) {
        this.currentCharge -= charge;
        if (this.currentCharge < 0) {
            this.currentCharge = 0;
        }
        Anim.playerChargeSpent(charge);
        this._updateChargeDisplay();
    }

    get chargePercent() {
        return Math.floor(this.currentCharge / this.maxCharge * 100);
    }

    useChargeAbility(abilityId) {
        let ability;
        for (const a of this.chargeAbilities) {
            if (a.id == abilityId) {
                ability = a;
            }
        }
        if (!ability) {
            console.log("Player does not own this ability!");
            return;
        }
        if(ability.cost > this.currentCharge) {
            log("Cannot afford ability!");
            return false;
        }
        let result = ability.use();
        if (result) this.removeCharge(ability.cost);

        let syringeRelic = relicHandler.getRelic(RELIC_ID.SYRINGE);
        if (syringeRelic && syringeRelic.isActive) {
            syringeRelic.update(false);
        }
    }

    newAbility(abilityId) {
        this.chargeAbilities.push(AbilityFactory.generateAbility(abilityId));
        
        if (this.chargeAbilities.length <= 5) {
            UI.Ability.updateDisplay(this);
            return true;
        }

        // limit of 5 charge abilites, must remove one

        UI.Player.abilityOverflow(this.chargeAbilities, director.gameState, true);
        return false;
    }

    removeAbility(abilityId) {
        this.chargeAbilities = this.chargeAbilities.filter((a) => {
            return a.id != abilityId;
        });
        UI.Ability.updateDisplay(this);
    }

    getChargeAbility(abilityId) {
        for (const a of this.chargeAbilities) {
            if (a.id == abilityId) return a;
        }
        return null;
    }

    useConsumable(consumableIndex) {
        let i = parseInt(consumableIndex);
        console.log(consumableIndex);
        console.log(i)
        let result = this.consumables[i].use();
        if (result) { // successful use
            this.consumables.splice(i, 1);
            UI.Player.updateConsumableDisplay(this);
        }
    }

    // selector function takes in the letters arr as input. Returns the letters that the effect will be applied on
    applyTileEffect(tileEffectType, selectorFunction, stateVar) {
        let letters = UI.Letter.getLetters().toArray();
        let affectedLetters = selectorFunction(letters);

        for (const l of affectedLetters) {
            let e = Letter.getLetterObjectFromElement(l);
            e.applyTileEffect(l, tileEffectType, stateVar);
        }
    }   

    // adding in handling tile effects
    resolvePostTurnEffects() {
        super.resolvePostTurnEffects();

        // resolve tile effects
        for (const e of UI.Letter.getLetters().toArray()) {
            let l = Letter.getLetterObjectFromElement(e);
            l.resolveTileEffects(e, true);
        }
    }

    resolvePreTurnEffects() {
        super.resolvePreTurnEffects();

        //resolve tile effects
        for (const e of UI.Letter.getLetters().toArray()) {
            let l = Letter.getLetterObjectFromElement(e);
            l.resolveTileEffects(e, false);
        }
    }
}