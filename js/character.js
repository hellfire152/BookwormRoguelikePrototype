class Character {
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

    async resolvePreTurnEffects() {
        for (const effType in this.effects) {
            if (!this.effects[effType]) continue;
            let result = await this.effects[effType].resolvePreTurn(this);
            this.handleEffectResolution(effType, result);
        }
        this._updateEffectDisplay();
    }

    async resolvePostTurnEffects() {
        for(const effType in this.effects) {
            if (!this.effects[effType]) continue;
            console.log(this);
            console.log(effType);
            let result = await this.effects[effType].resolvePostTurn(this);
            this.handleEffectResolution(effType, result);
        }
        this._updateEffectDisplay();
    }
    // call a custom function of an effect
    customResolveEffect(effectType, args) {
        if (!this.effects[effectType]) return;
        let result = this.effects[effectType].resolve(args);
        this.handleEffectResolution(effectType, result);
    }

    handleEffectResolution(effType, result) {
        if(result && result.removeEffect) {
            this.effects[effType] = null;
        }
    }

    applyEffect(effType, value) {
        if(!this.effects[effType]) {
            this.effects[effType] = EffectFactory.generateEffect(effType, value);
        } else {
            this.effects[effType].reapply(value);
        }
        this._updateEffectDisplay();
    }

    removeEffect(effType) {
        if (!this.effects[effType]) return false;
        this.effects[effType] = null;
        this._updateEffectDisplay();
        return true;
    }

    dealDamage(damage) {
        let postModifierDamage = damage;
        if (this.effects[Effect.EFFECT_TYPES.VULNERABLE]) {
            postModifierDamage = damage * 1.5;
        }
        return this.dealDamageFixed(postModifierDamage);
    }
    dealDamageFixed(damage) { // for damage unaffected by effects (e.g.) poison
        if (this.shield) {
            if (this.shield >= damage) {
                this.shield = this.shield - damage;
            } else {
                let overflow = damage - this.shield;
                this.shield = 0;
                this.currentHP -= overflow;
            }
        } else {
            this.currentHP -= damage;
        }
        this.currentHP = Utils.roundToOneDP(this.currentHP);
        this._updateHPDisplay();
        return {damage};
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

    get hpPercent() {
        return Math.floor(this.currentHP / this.maxHP * 100);
    }

    get isStunned() {
        return !!this.effects[Effect.EFFECT_TYPES.STUN];
    }

    get shield() {
        if (this.effects[Effect.EFFECT_TYPES.SHIELD]) {
            return this.effects[Effect.EFFECT_TYPES.SHIELD].value;
        }
        return null;
    }

    set shield(value) {
        let shieldEffect = this.effects[Effect.EFFECT_TYPES.SHIELD];
        if (value <= 0) {
            this.effects[Effect.EFFECT_TYPES.SHIELD] = null;
        } else if (shieldEffect) {
            shieldEffect.value = value;
        } else {
            this.applyEffect(Effect.EFFECT_TYPES.SHIELD, value);
        }
        this._updateEffectDisplay();
    }

    get isSilenced() {
        return !!this.effects[Effect.EFFECT_TYPES.SILENCE];
    }

    get isConfused() {
        return !!this.effects[Effect.EFFECT_TYPES.CONFUSION];
    }
    
    // common methods to implement in child classes
    _updateHPDisplay() {}
}   