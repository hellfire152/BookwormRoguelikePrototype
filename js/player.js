class Player {
    constructor() {
        this.money = 0;
        this.items = [];
        this.flags = {};
        this.relics = new Set();
        this.maxHP = 100;
        this.currentHP = this.maxHP;

        this.consumables = {}
        for (const i in CONSUMABLE_ID) {
            this.consumables[CONSUMABLE_ID[i]] = 0;
        }
    }

    attemptPurchase(itemID, itemType) {
        let item = CONSUMABLE_DETAILS[itemID];
        console.log(item);
        if (this.money < item.baseCost) {
            log(`Insufficient Money for ${item.name}!`);
            return false;
        } else {
            this.money -= item.baseCost;
            if (itemType == "consumable") {
                this.consumables[itemID] += 1
            }
            this._updateConsumableDisplay();
            this._updateMoneyDisplay();
            log(`Puchased ${item.name} for ${item.baseCost} Money!`);
            return true;
        }
    }

    _updateConsumableDisplay() {
        $("#owned-consumables").empty();
        for (const i in this.consumables) {
            if (this.consumables[i] <= 0) continue;
            let item = CONSUMABLE_DETAILS[i];

            let consumableContainer = $("<div>");
            consumableContainer.addClass("player-consumable");
            consumableContainer.attr("_itemid", i);

            let consumableSprite = $("<img>");
            consumableSprite.addClass("item-sprite");
            consumableSprite.attr("src", item.sprite);

            let itemAmount = $("<div>");
            itemAmount.addClass("player-consumable-amount");
            itemAmount.text(this.consumables[i]);

            consumableContainer.append(consumableSprite, itemAmount);
            $("#owned-consumables").append(consumableContainer);
        }
    }

    giveMoney(amountGiven) {
        this.money += parseInt(amountGiven);

        //set value in UI
        this._updateMoneyDisplay();
    }

    _updateMoneyDisplay() {
        $("#player-money").text(`${this.money} Money`)
    }

    checkFlag(flag) {
        return !!this.flags[flag]
    }

    setFlag(flag) {
        this.flags[flag] = true;
    }

    dealDamage(damage) {
        this.currentHP -= damage;
        this._updateHPDisplay();
        if (this.currentHP <= 0) {
            alert(`Game Over! You lasted ${levelsCleared} rounds.`);
        }
        return true;
    }

    healDamage(healAmount) {
        this.currentHP += healAmount;
        if (this.currentHP > this.maxHP) {
            this.currentHP = this.maxHP;
        }
        this._updateHPDisplay();
    }

    _updateHPDisplay() {
        $("#player-hp").text(`${this.currentHP}/${this.maxHP} HP`)
    }

    setHP(hp) {
    }

    setMaxHP(hp) {

    }

    addRelic(relic) {
        this.relics.add(relic);

        //TODO: Add the relic to the relic list
        return true;
    }
    removeRelic(relic) {
        return this.relics.delete(relic);
    }
    checkRelic(relic) {
        return this.relics.has(relic);
    }

    useConsumable(itemID) {
        if (this.consumables[itemID] <= 0) {
            log("You do not own that item!");
            return false;
        }

        let cons = CONSUMABLE_DETAILS[itemID];
        let isConsumableUseSuccessful = cons.onUse();
        this.consumables[itemID] -= 1;
        this._updateConsumableDisplay();
    }
}