class Player extends Character {
    constructor() {
        super();
        this.money = 0;
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
                UI.Player.updateMoneyDisplay(this);
                log(`Puchased ${consumable.name} for ${consumable.baseCost} Money!`);
                return true;
            }
        }
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

    giveMoney(amountGiven) {
        this.money += parseInt(amountGiven);

        //set value in UI
        UI.Player.updateMoneyDisplay(this);
    }

    checkFlag(flag) {
        return !!this.flags[flag]
    }

    setFlag(flag) {
        this.flags[flag] = true;
    }

    dealDamage(damage) {
        let result = super.dealDamage(damage);
        log(`Player was dealt ${result.damage} damage!`);
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
        this._updateChargeDisplay();
    }

    removeCharge(charge) {
        this.currentCharge -= charge;
        if (this.currentCharge < 0) {
            this.currentCharge = 0;
        }
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
    }

    newAbility(abilityId) {
        this.chargeAbilities.push(AbilityFactory.generateAbility(abilityId));
        
        if (this.chargeAbilities.length <= 5) {
            return UI.Ability.updateDisplay(this);
        }

        // limit of 5 charge abilites, must remove one
        ui.saveCurrentSceneState();

    }

    removeAbility(abilityId) {
        this.chargeAbilities.filter((a) => {
            return a.id != abilityId;
        });
        UI.Ability.updateDisplay(this);
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
}