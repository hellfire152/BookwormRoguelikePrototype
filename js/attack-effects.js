class AttackEffect {
    static TYPES = {
        DAMAGE : "AE|DAMAGE",
        HEAL : "AE|HEAL",
        RANDOM_REPLACEMENT : "AE|RANDOM_REPLACEMENT",
        DESTROY_TILE : "AE|DESTROY_TILE",
        APPLY_STATUS : "AE|APPLY_STATUS",
        APPLY_TILE_EFFECT : "AE|APPLY_TILE_EFFECT",
        CHARGE_DRAIN : "AE|CHARGE_DRAIN",
        GENERATE_TILE : "AE|GENERATE_TILE",
        STEAL_MONEY : "AE|STEAL_MONEY"
    }
    // could just create new AttackEffects directly, but these methods
    // should make the code a lot readable
    static damageEffect(target, value) {
        return new AttackEffect({
            type : AttackEffect.TYPES.DAMAGE,
            value : value,
            target : target,
            apply : async (ref, source) => {
                let v = Utils.getValue(ref.value, ref);
                let s = source || "Player";
                if (ref.target == "player") {
                    await player.dealDamage(v);
                    log(`${currentEnemy.name} dealt ${v} damage`);
                } else if (ref.target == "enemy") {
                    await currentEnemy.dealDamage(v);
                    log(`${s} dealt ${v} damage to ${currentEnemy.name}`);
                }
            }
        });
    }
    static healEffect(target, value) {
        return new AttackEffect({
            type : AttackEffect.TYPES.HEAL,
            value : value,
            target : target,
            apply : (ref) => {
                let v = Utils.getValue(ref.value);
                if (ref.target == "player") {
                    player.healDamage(v);
                    log(`Player healed for ${v} HP`)
                } else if (ref.target == "enemy") {
                    currentEnemy.healDamage(v);
                    log(`${currentEnemy.name} healed for ${v} HP`)
                }
            }
        });
    }
    static stealMoneyEffect(value) {
        return new AttackEffect({
            type : AttackEffect.TYPES.STEAL_MONEY,
            value : value,
            apply : (ref) => {
                player.takeMoney(ref.value);
                log(`${ref.value} Money was stolen!`);
            }
        })
    } 
    // no target as this can only apply to the player
    static replacementEffect(type, value, newLetter) {
        let ae = new AttackEffect({
            type : "letter-replacement",
            value : value,
        });
        ae.newLetter = newLetter;
        switch(type) {
            case AttackEffect.TYPES.RANDOM_REPLACEMENT : {
                ae.apply = (ref) => {
                    let letters = UI.Letter.getLetters().toArray();
                    let newl = ref.newLetter();
                    let randomLetters = _.sampleSize(letters, ref.value);
                    for (const letter of randomLetters) {
                        let t = $(letter);
                        let l = Letter.getLetterObjectFromElement(t);
                        l.replaceLetter(t, newl);
                    }
                    log(`${ref.value} letters got replaced to ${newl}`)
                }
                break;
            }
        }
        return ae;
    }
    static applyStatusEffect(target, effectType, value) {
        return new AttackEffect({
            type : AttackEffect.TYPES.APPLY_STATUS,
            value : value,
            target : target,
            apply : (ref) => {
                if (ref.target == "player") {
                    player.applyEffect(effectType, value);
                } else if (ref.target == "enemy") {
                    currentEnemy.applyEffect(effectType, value);
                }
            }
        });
    }
    static destroyTileEffect(value) {
        return new AttackEffect({
            type : AttackEffect.TYPES.DESTROY_TILE,
            value : value,
            apply : (ref) => {
                let letters = UI.Letter.getLetters().toArray();
                let randomLetters = _.sampleSize(letters, ref.value);
                for (const letter of randomLetters) {
                    let t = $(letter);
                    Letter.removeLetterFromElement(t);
                }
                log(`${ref.value} letters were destroyed!`);
            }
        });
    }

    static applyTileEffect(tileEffectType, selectorFunction, data) {
        return new AttackEffect({
            type : AttackEffect.APPLY_TILE_EFFECT,
            value : tileEffectType,
            apply : (ref) => {
                player.applyTileEffect(tileEffectType, selectorFunction, data);
            }
        })
    }

    static chargeDrainEffect(value) {
        return new AttackEffect({
            type : AttackEffect.TYPES.CHARGE_DRAIN,
            value : value,
            apply : (ref) => {
                player.removeCharge(value);
            }
        })
    }
    
    static generateTileEffect(value, letterFunction) {
        return new AttackEffect({
            type : AttackEffect.GENERATE_TILE,
            value : value,
            apply : (ref) => {
                Letter.generateLetters(value, letterFunction);
            }
        })
    }

    constructor(data) {
        this.type = data.type;
        this.value = data.value;
        this.target = data.target;
        if(data.apply) this.apply = data.apply;
    }
    // called when resolving effect
    apply() {console.log("Unimplemented");}
}
