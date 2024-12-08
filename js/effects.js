class Effect {
    static EFFECT_TYPES = {
        POISON : 0,
        GENERATE_SHIELD : 1,
        TAKE_MORE_DAMAGE : 2,
        REDUCED_DAMAGE : 3,

    }    

    constructor(effectOptions) {
        this.effectType = effectOptions.effectType;
        this.value = effectOptions.value;
        this.duration = effectOptions.duration;
        this.sprite = effectOptions.sprite;
    }
    // behaviour if the status is already present, and it is reapplied
    // default is to take the max duration between the two
    reapply(value) {
        this.duration = _.max(this.duration, value);
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

class PoisonEffect extends Effect {
    constructor(value) {
        super({
            effectType : Effect.EFFECT_TYPES.POISON,
            value : Math.floor(value),
            duration : null, // unused since poison duration is based on value,
            sprite : null
        });
    }

    resolvePostTurn(character) {
        character.dealDamage(this.value, false);
        log(`${character.name} took ${this.value} damage from Poison`);
        // effect is reduced by half every turn
        if (this.value <= 1) {
            return {
                removeEffect : true
            }
        }
        this.value = Math.floor(this.value / 2);
        return {
            removeEffect : false
        }
    }

    reapply(value) {
        this.value += Math.floor(value);
    }

    generateElement(type) { // show value instead of duration
        return super.generateElement(type, "value");
    }
}

class EffectFactory {
    static generateEffect(effType, value) {
        switch(effType) {
            case Effect.EFFECT_TYPES.POISON : {
                return new PoisonEffect(value);
            }
        }
    }
}