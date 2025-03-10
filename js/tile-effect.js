const TILE_EFFECTS = {
    LOCK : "TE|LOCK",
    MONEY_LOCK : "TE|MONEY_LOCK",
    CHARGE_LOCK : "TE|CHARGE_LOCK",
    POISONOUS : "TE|POISONOUS",
    CURSED : "TE|CURSED",
    SPIKED : "TE|SPIKED",
    CLEANSING : "TE|CLEANSING",
    DECAY : "TE|DECAY",
    RADIOACTIVE : "TE|RADIOACTIVE",
    WEAKEN : "TE|WEAKEN",
    HARMONIZED : "TE|HARMONIZED",
    EMPHASIZED : "TE|EMPHASIZED",
    SUPERCHARGED : "TE|SUPERCHARGED",
    COMPELLED : "TE|COMPELLED",
    STUTTER : "TE|STUTTER"
}

// basically an abstract class. Has some static factory methods to actually create the TileEffect instances
class TileEffect {
    constructor(data) {
        this.id = data.id;
        this.modifyLetterElement = data.modifyLetterElement || this.modifyLetterElement;
        this.state = data.state || this.state;
        this.update = data.update || this.update;
        this.reapply = data.reapply || this.reapply;
        this.resolvePreTurnEffects = data.resolvePreTurnEffects || this.resolvePreTurnEffects;
        this.resolvePostTurnEffects = data.resolvePostTurnEffects || this.resolvePostTurnEffects;
        this.isDebuff = data.isDebuff || false;
        this.isCleansable = data.isCleansable || true;
    }

    state = null; // to track certain things if need be
    modifyLetterElement(element) {return element;}
    update(ref) {
        ref.state--;
        return {
            removeEffect : ref.state <= 0
        }
    } // call when updating internal state and visuals need to be updated, return {removeEffect} if the effect should be removed.
    reapply() {} // call if somehow the attack effect is reapplied onto the same tile
    resolvePreTurnEffects() {} // define this function if something should be done pre turn
    resolvePostTurnEffects(ref) {return ref.update(ref)} // define this function if something should be done post turn, default behaviour is ticking down the duration
    
    // generic factory method if the exact type may not be known
    static generateTileEffect(tileEffectType, data) {
        switch(tileEffectType) {
            case TILE_EFFECTS.LOCK : {
                return TileEffect.lock(data.duration);
            }
            case TILE_EFFECTS.MONEY_LOCK : {
                return TileEffect.moneyLock(data.cost, data.duration);
            }
            case TILE_EFFECTS.CHARGE_LOCK : {
                return TileEffect.chargeLock(data.cost, data.duration);
            }
            case TILE_EFFECTS.SPIKED : {
                return TileEffect.spiked(data.damage, data.duration);
            }
            case TILE_EFFECTS.CURSED : {
                return TileEffect.cursed(data.duration);
            }
            case TILE_EFFECTS.POISONOUS : {
                return TileEffect.poisonous(data.duration);
            }
            case TILE_EFFECTS.EMPHASIZED : {
                return TileEffect.emphasized(data.duration);
            }
            case TILE_EFFECTS.SUPERCHARGED : {
                return TileEffect.supercharged(99);
            }
            case TILE_EFFECTS.HARMONIZED : {
                return TileEffect.harmonized(data.duration);
            }
            case TILE_EFFECTS.COMPELLED : {
                return TileEffect.compelled(data.duration);
            }
            case TILE_EFFECTS.STUTTER : {
                return TileEffect.stutter(data.duration);
            }
        }
    }

    // -- FACTORY METHODS FOR EACH TILE EFFECT -- 
    static lock(duration) {
        return new TileEffect({
            id : TILE_EFFECTS.LOCK,
            modifyLetterElement : (element) => {
                element.addClass("tile-effect-lock");
                return element;
            },
            state : duration,
            isDebuff : true,
        });
    }

    static moneyLock(cost, duration) {
        let te = new TileEffect({
            id : TILE_EFFECTS.MONEY_LOCK,
            modifyLetterElement : (element) => {
                element.addClass("tile-effect-money-lock");
                return element;
            },
            state : duration,
            isDebuff : true,
        });
        te.moneyCost = cost;
        return te;
    }

    static chargeLock(cost, duration) {
        let te = new TileEffect({
            id : TILE_EFFECTS.CHARGE_LOCK,
            modifyLetterElement : (element) => {
                element.addClass("tile-effect-charge-lock");
                return element;
            },
            state : duration,
            isDebuff : true
        });
        te.chargeCost = cost;
        return te;
    }

    static spiked(damage, duration) {
        let te = new TileEffect({
            id : TILE_EFFECTS.SPIKED,
            modifyLetterElement : (element) => {
                element.addClass("tile-effect-spiked");
                return element;
            },
            state : duration,
            isDebuff : true
        });
        te.damage = damage;
        return te;
    }

    static cursed(duration) {
        return new TileEffect({
            id : TILE_EFFECTS.CURSED,
            modifyLetterElement : (element) => {
                element.addClass("tile-effect-cursed");
                return element;
            },
            state : duration,
            isDebuff : true
        });
    }

    static poisonous(duration) {
        return new TileEffect({
            id : TILE_EFFECTS.POISONOUS,
            modifyLetterElement : (element) => {
                element.addClass("tile-effect-poisonous");
                return element;
            },
            state : duration
        })
    }

    static harmonized(duration) {
        return new TileEffect({
            id : TILE_EFFECTS.HARMONIZED,
            modifyLetterElement : (element) => {
                element.addClass("tile-effect-harmonized");
                return element;
            },
            state : duration
        })
    }

    static emphasized(duration) {
        return new TileEffect({
            id : TILE_EFFECTS.EMPHASIZED,
            modifyLetterElement : (element) => {
                element.addClass("tile-effect-emphasis");
                return element;
            },
            state : duration
        });
    }

    static supercharged(duration) {
        return new TileEffect({
            id : TILE_EFFECTS.SUPERCHARGED,
            modifyLetterElement : (element) => {
                element.addClass("tile-effect-supercharged");
                return element;
            },
            state : duration
        })
    }

    static compelled(duration) {
        return new TileEffect({
            id : TILE_EFFECTS.COMPELLED,
            modifyLetterElement : (element) => {
                element.addClass("tile-effect-compelled");
                return element;
            },
            state : duration,
            isDebuff : true
        })
    }

    static stutter(duration) {
        return new TileEffect({
            id : TILE_EFFECTS.STUTTER,
            modifyLetterElement : (element) => {
                element.addClass("tile-effect-stutter");
                return element;
            },
            state : duration
        })
    }
}