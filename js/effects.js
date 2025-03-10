class Effect {
    static EFFECT_TYPES = {
        POISON : 0,
        GENERATE_SHIELD : 1,
        WEAKNESS : 2,
        INVULNERABILITY : 3,
        STUN : 4,
        CONFUSION : 5, // player only
        SHIELD : 6,
        SILENCE : 7,
        VULNERABLE : 8,
        DAMAGE_BOOST : "E|DAMAGE_BOOST",
        SNAKE_VENOM : "E|SNAKE_VENOM",
        GREED : "E|GREED" // pig boss passive
    }    

    constructor(effectOptions) {
        this.effectType = effectOptions.effectType;
        // value and duration are two separate values in case I need both in the future
        this.value = effectOptions.value;
        this.duration = effectOptions.duration;
        this.sprite = effectOptions.sprite;
        this.isDebuff = effectOptions.isDebuff || false;
        this.isCleansable = effectOptions.isCleansable || true;
    }

    // behaviour if the status is already present, and it is reapplied
    // default is to take the max duration between the two
    reapply(value) {
        this.duration = _.max([this.duration, value]);
    }
    // trigger points for each effect
    resolvePreTurn(character) {
        //no pre-turn effects by default
    }
    // default behaviour is to reduce duration by 1 at end of turn
    resolvePostTurn(character) {
        this.duration -= 1;
        if (this.duration <= 0) {
            return {
                removeEffect : true
            }
        }
    }

    generateElement(type, displayValue) {
        let effectContainer = $("<div>");
        effectContainer.addClass(`${type}-effect-container`);

        let effectSprite = $("<img>");
        effectSprite.attr("src", this.sprite);
        effectSprite.addClass(`${type}-effect-sprite`);

        let effectText = $("<div>");
        effectText.text((displayValue) ? this[displayValue] : this.duration);
        effectText.addClass(`${type}-effect-text`);

        effectContainer.append(effectSprite, effectText);
        return effectContainer;
    }
}

class DamageBoostEffect extends Effect {
    constructor(value) {
        super({
            effectType : Effect.EFFECT_TYPES.DAMAGE_BOOST,
            value : value,
            duration : null,
            sprite : "./sprites/effects/Questionmorks.png"
        });
    }

    // damage boost only lasts for one attack
    // as the effect resolving logic will not trigger if the enemy is defeated,
    // we have to remove this effect manually during damage calc
    resolvePostTurn(character) {}
    resolvePreTurn(character) {}

    reapply(v) { // damage boost stacks
        this.value += v - 1;
    }
    generateElement(type) { // show value instead of duration
        return super.generateElement(type, "value");
    }
}

class PoisonEffect extends Effect {
    constructor(value) {
        super({
            effectType : Effect.EFFECT_TYPES.POISON,
            value : Math.floor(value),
            duration : null, // unused since poison duration is based on value,
            sprite : "./sprites/effects/poison.png",
            isDebuff : true
        });
    }

    async resolvePostTurn(character) {
        if (typeof character == "Player") character.name = "Player";
        log(`${character.name} took ${this.value} damage from Poison`);
        await character.dealDamage(this.value, false, "poison");
        
        if (--this.value < 1) {
            return {
                removeEffect : true
            }
        }
    }

    reapply(value) {
        this.value += Math.floor(value);
    }

    generateElement(type) { // show value instead of duration
        return super.generateElement(type, "value");
    }
}

class StunEffect extends Effect {
    constructor(value) {
        super({
            effectType : Effect.EFFECT_TYPES.STUN,
            value : null,
            duration : value,
            sprite : "./sprites/effects/Stun.png",
            isDebuff : true
        });
    }

    resolvePostTurn() {} 
    resolvePreTurn() {}
    resolve() { // only count down during enemy turn, call this manually
        return super.resolvePostTurn();
    }
}

class ShieldEffect extends Effect {
    constructor(value) {
        super({
            effectType : Effect.EFFECT_TYPES.SHIELD,
            value : value,
            duration : null,
            sprite : "./sprites/effects/Shield.png"
        });
    }

    resolvePostTurn() {}
    resolvePreTurn() {
        // shield always expires before their turn
        // may have relics that change this behaviour to implement later
        return {
            removeEffect : true
        };
    }
    generateElement(type) { // show value instead of duration
        return super.generateElement(type, "value");
    }
}

// unique effect for snek elite
class SnakeVenomEffect extends Effect {
    constructor(value) {
        super({
            effectType : Effect.EFFECT_TYPES.SNAKE_VENOM,
            value : value,
            duration : null,
            sprite : "./sprites/effects/Poison.png",
            isDebuff : true,
            isCleansable : false
        });
    }

    async resolvePostTurn(character) {
        this.value++;
        log(`${character.name} took ${this.value} damage from Snake Venom`);
        await character.dealDamage(this.value, false, "poison");
    }

    reapply(value) {
        this.value += Math.floor(value);
    }

    generateElement(type) { // show value instead of duration
        return super.generateElement(type, "value");
    }
}

class GreedEffect extends Effect {
    constructor(value) {
        super({
            effectType : Effect.EFFECT_TYPES.GREED,
            value : value,
            duration : null,
            sprite : "./sprites/Questionmorks.png"
        });
    }

    resolvePostTurn() {} // don't tick down post turn
    reapply(value) {
        this.value += value;
    }
    generateElement(type) {
        return super.generateElement(type, "value");
    }
}

class EffectFactory {
    static generateEffect(effType, value) {
        switch(effType) {
            case Effect.EFFECT_TYPES.POISON : {
                return new PoisonEffect(value);
            }
            case Effect.EFFECT_TYPES.WEAKNESS : {
                return new Effect({
                    effectType : Effect.EFFECT_TYPES.WEAKNESS,
                    value : null,
                    duration : value,
                    sprite : "./sprites/effects/Weaken.png",
                    isDebuff : true
                });
            }
            case Effect.EFFECT_TYPES.VULNERABLE : {
                return new Effect({
                    effectType : Effect.EFFECT_TYPES.VULNERABLE,
                    value : null,
                    duration : value,
                    sprite : "./sprites/effects/Weakness.png",
                    isDebuff : true,
                });
            }
            case Effect.EFFECT_TYPES.STUN : {
                return new StunEffect(value);
            }
            case Effect.EFFECT_TYPES.SHIELD : {
                return new ShieldEffect(value);
            }
            case Effect.EFFECT_TYPES.SILENCE : {
                return new Effect({
                    effectType : Effect.EFFECT_TYPES.SILENCE,
                    value : null,
                    duration : value,
                    sprite : "./sprites/effects/Silenced.png",
                    isDebuff : true
                });
            }
            case Effect.EFFECT_TYPES.CONFUSION : {
                return new Effect({
                    effectType : Effect.EFFECT_TYPES.CONFUSION,
                    value : null,
                    duration : 5,
                    sprite : "./sprites/effects/Confusion.png",
                    isDebuff : true
                });
            }
            case Effect.EFFECT_TYPES.DAMAGE_BOOST : {
                return new DamageBoostEffect(value);
            }
            case Effect.EFFECT_TYPES.SNAKE_VENOM : {
                return new SnakeVenomEffect(value);
            }
            case Effect.EFFECT_TYPES.GREED : {
                return new GreedEffect(value);
            }
        }
    }
}