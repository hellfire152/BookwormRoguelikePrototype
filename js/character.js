class Character {
    static getValue(v, args) {
        if (_.isFunction(v)) return v(args);
        return v;
    }

    constructor() {
        this.effects = {};
        for (const eff in Effect.EFFECT_TYPES) {
            this.effects[Effect.EFFECT_TYPES[eff]] = null;
        }
    }

    getStatuses() { // mainly used for UI updates
        let statuses = [];
        for (let e in this.effects) {
            if (!!this.effects[e]) statuses.push(this.effects[e]);
        }
        return statuses;
    }

    checkHasStatus(statusId) {
        return !!this.effects[statusId];
    }

    removeAllStatuses() {
        for (let e in this.effects) {
            this.effects[e] = null;
        }
        this._updateEffectDisplay();
    }

    resolvePreTurnEffects() {
        for (const effType in this.effects) {
            if (!this.effects[effType]) continue;
            let result = this.effects[effType].resolvePreTurn(this);
            if(result && result.removeEffect) {
                this.effects[effType] = null;
            }
        }
        this._updateEffectDisplay();
    }

    resolvePostTurnEffects() {
        for(const effType in this.effects) {
            if (!this.effects[effType]) continue;
            let result = this.effects[effType].resolvePostTurn(this);
            if(result && result.removeEffect) {
                this.effects[effType] = null;
            }
        }
        this._updateEffectDisplay();
    }

    applyEffect(effType, value) {
        if(!this.effects[effType]) {
            this.effects[effType] = EffectFactory.generateEffect(effType, value);
        } else {
            this.effects[effType].reapply(value);
        }
        this._updateEffectDisplay();
    }

    removeEffect() {
        if (!this.effects[effType]) return false;
        this.effects[effType] = null;
        this._updateEffectDisplay();
        return true;
    }

    dealDamage(damage) {
        this.currentHP -= damage;
        this.currentHP = ((this.currentHP * 10) << 0) * 0.1; // round to 1 decimal place
        this._updateHPDisplay();
        return !this.isAlive;
    }

    healDamage(healAmount) {
        this.currentHP += healAmount;
        if (this.currentHP > this.maxHP) {
            this.currentHP = this.maxHP;
        }
        this._updateHPDisplay();
    }

    setHP(hp) {
        this.currentHP = hp;
        this._updateHPDisplay();
    }

    setMaxHP(hp) {
        this.maxHP = hp;
        this._updateHPDisplay();
    }

    _updateEffectDisplay(type) {
        let statusContainer = $(`#${type}-status-container`);
        statusContainer.empty();

        for (const e of this.getStatuses()) {
            statusContainer.append(e.generateElement(type));
        }
    }

    get isAlive() {
        return this.currentHP > 0;
    }

    // common methods to implement in child classes
    _updateHPDisplay() {}
}   