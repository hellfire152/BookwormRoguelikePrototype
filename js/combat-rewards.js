class CombatReward {
    static collateRewards(rewardsArr) {
        let rewards = {};
        for (const r of rewardsArr) {
            r.getReward(rewards);
        }
        return rewards;
    }

    static money(value, probability) {
        return new CombatReward({
            field : "money",
            value,
            probability
        });
    }

    static heal(value, probability) {
        return new CombatReward({
            field : "heal",
            value,
            probability
        });
    }

    static charge(value, probability) {
        return new CombatReward({
            field : "charge",
            value,
            probability
        })
    }

    static relic(id, probability) {
        return new CombatReward({
            field : "relic",
            value : id,
            probability
        })
    }

    constructor (data) {
        this.field = data.field;
        this.value = data.value;
        this.probability = data.probability;
    }

    getReward(obj) {
        if (this.probability && Math.random >= this.probability) return;
        if(this.field == "relic") {
            if (!Object.hasOwn(obj, "relic")) obj.relic = [];
            if (this.value == null) {
                this.value = relicHandler.getRandomUnownedRelic(1)[0].id;
            }
            obj.relic.push((this.value));
            return;
        }
        if (!Object.hasOwn(obj, this.field)) obj[this.field] = 0;
        obj[this.field] += Utils.getValue(this.value);
    }
}