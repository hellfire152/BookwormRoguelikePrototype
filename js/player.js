class Player extends Character {
    constructor() {
        super();
        this.money = 0;
        this.items = [];
        this.flags = {};
        this.maxHP = 100;
        this.currentHP = this.maxHP;
        this.consumables = {}
        for (const i in CONSUMABLE_ID) {
            this.consumables[CONSUMABLE_ID[i]] = 0;
        }
    }

    attemptPurchase(itemID, itemType) {
        let item = CONSUMABLE_DETAILS[itemID];
        if (this.money < item.baseCost) {
            log(`Insufficient Money for ${item.name}!`);
            return false;
        } else {
            this.money -= item.baseCost;
            if (itemType == "consumable") {
                this.consumables[itemID] += 1
            }
            UI.Player.updateConsumableDisplay(this);
            UI.Player.updateMoneyDisplay(this);
            log(`Puchased ${item.name} for ${item.baseCost} Money!`);
            return true;
        }
    }

    _updateHPDisplay() {
        UI.Player.updateHPDisplay(this);
    }
    _updateEffectDisplay() {
        UI.Player.updateStatusDisplay(this.getStatuses());
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
        if (result) {
            alert(`Game Over! You lasted ${levelsCleared} rounds.`);
        }
        return false;
    }

    useConsumable(itemID) {
        if (this.consumables[itemID] <= 0) {
            log("You do not own that item!");
            return false;
        }

        let cons = CONSUMABLE_DETAILS[itemID];
        let isConsumableUseSuccessful = cons.onUse();
        if (isConsumableUseSuccessful) { // successful use
            this.consumables[itemID] -= 1;
            UI.Player.updateConsumableDisplay();
        }
    }
}