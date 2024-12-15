const COMBAT_PHASES = [
    "PLAYER_STANDBY",
    "PLAYER_POST_TURN",
    "ENEMY_PRE_TURN",
    "ENEMY_ACTION",
    "ENEMY_POST_TURN",
    "PLAYER_PRE_TURN"
]
const LENGTH_DAMAGE_MULTIPLIERS = { // probably replace with an actual formula later
    3 : 1,
    4 : 1,
    5 : 1.1,
    6 : 1.2,
    7 : 1.3,
    8 : 1.55,
    9 : 1.7,
    10 : 1.8,
    11 : 1.9,
    12 : 2.0,
    13 : 2.2,
    14 : 2.5,
    15 : 3.0
}
let LETTER_DAMAGE_VALUES = {
    "a" : 1,
    "b" : 2,
    "c" : 2,
    "d" : 2,
    "e" : 1,
    "f" : 2,
    "g" : 2,
    "h" : 2,
    "i" : 1,
    "j" : 3,
    "k" : 3,
    "l" : 2,
    "m" : 3,
    "n" : 2,
    "o" : 1,
    "p" : 3,
    "q" : 4,
    "r" : 2,
    "s" : 1,
    "t" : 1,
    "u" : 1,
    "v" : 4,
    "w" : 3,
    "x" : 3,
    "y" : 3,
    "z" : 4,
    "?" : 0
}
let confusedDamageValues;
let LETTER_UPGRADE_DAMAGE_INCREASE = {
    "a" : 0.5,
    "b" : 1,
    "c" : 1,
    "d" : 1,
    "e" : 0.5,
    "f" : 1,
    "g" : 1,
    "h" : 1,
    "i" : 0.5,
    "j" : 1.5,
    "k" : 1.5,
    "l" : 1,
    "m" : 1.5,
    "n" : 1,
    "o" : 0.5,
    "p" : 1.5,
    "q" : 2,
    "r" : 1,
    "s" : 0.5,
    "t" : 0.5,
    "u" : 0.5,
    "v" : 2,
    "w" : 1.5,
    "x" : 1.5,
    "y" : 1.5,
    "z" : 2
}

// handles combat related things and turn order
class CombatHandler {
    constructor() {
        this.combatPhaseIndex = null;
    }

    // this function calls resolveTurn. Purpose is to avoid using recurring function calls
    handleTurn(skipTurn = false) {
        let continueTurn;
        do {
            if (COMBAT_PHASES[this.combatPhaseIndex] == "PLAYER_STANDBY" 
                && player.isStunned) {
                skipTurn = true;
            }
            continueTurn = this.resolveTurn(skipTurn);
        } while(continueTurn)
    }
    resolveTurn(skipTurn = false) {
        switch(COMBAT_PHASES[this.combatPhaseIndex]) {
            case "PLAYER_STANDBY" : {
                if (skipTurn) {
                    console.log("Turn skipped");
                    // countdown stun if present
                    player.customResolveEffect(Effect.EFFECT_TYPES.STUN);
                    break;
                } else {
                    this._playerSubmit();
                    break;
                }
            }
            case "PLAYER_POST_TURN" : {
                player.resolvePostTurnEffects();
                break;
            }
            case "ENEMY_PRE_TURN" : {
                currentEnemy.resolvePreTurnEffects();
                break;
            }
            case "ENEMY_ACTION" : {
                if (currentEnemy.isStunned) {
                    currentEnemy.customResolveEffect(Effect.EFFECT_TYPES.STUN);
                    break;
                };
                currentEnemy.selectAndPerformAttack();
                break;
            }
            case "ENEMY_POST_TURN" : {
                currentEnemy.resolvePostTurnEffects();
                break;
            }
            case "PLAYER_PRE_TURN" : {
                player.resolvePreTurnEffects();
                break;
            }
        }

        if (++this.combatPhaseIndex >= COMBAT_PHASES.length) {
            this.combatPhaseIndex = 0;
        }

        let continueTurn =  player.isAlive && currentEnemy.isAlive
          && ((COMBAT_PHASES[this.combatPhaseIndex] == "PLAYER_STANDBY" 
            && player.effects[Effect.EFFECT_TYPES.STUN]) 
            || COMBAT_PHASES[this.combatPhaseIndex] != "PLAYER_STANDBY");
        return continueTurn;
    }

    // called on resolving player turn
    _playerSubmit() {
        let letters = UI.Letter.getLettersInInput();
        if(!letters) throw new Error("Invalid input?");
        let attackResult = this.calculateAttackResult(letters);

        // clear input and replace letters
        let letterElements = UI.Letter.getLetterElementsInInput();
        letterElements.each((index, element) => {
            Letter.removeLetterFromElement(element);
        });
        $("#send-input").prop("disabled", true);
        // remove placeholder letters
        $(".placeholder-letter").remove();
        // check which special tiles need to be generated
        let specialTilesToGenerate = this.specialTilesToGenerate(letters);
        // replace letters lost
        Letter.generateLetters(GAME_CONSTANTS.STARTING_LETTER_COUNT - 
            UI.Letter.getAvailableLetterElements().length, specialTilesToGenerate);

        // charge gain
        console.log(attackResult)
        player.gainCharge(attackResult.chargeGain);

        //handle damage to enemies
        currentEnemy.dealDamage(attackResult.damage, true);
        if (!currentEnemy.isAlive) {
            return false; // don't resovle effects if enemy dies early
        } 

        // first apply effects
        for (const e of attackResult.playerEffects) {
            player.applyEffect(e.effectType, e.value);
        }
        for (const e of attackResult.enemyEffects) {
            currentEnemy.applyEffect(e.effectType, e.value);
        }
        return true;
    }

    enemyDefeated(enemy) {
        let rewards = {
            "money" : 0,
            "heal" : 0
        }
        for (const r of enemy.rewards) {
            if (Math.random() >= r.probability) return;
            let v = Utils.getValue(r.value, this.level);
            switch(r.type) {
                case "money": {
                    rewards.money += v;
                    break;
                }
                case "heal" : {
                    rewards.heal += v;
                    break;
                }
                case "letter-replacement" : {

                }
            }
        }

        // switch to the rewards scene
        let options = [];
        options.push({
            text : "Upgrade a letter",
            onSelect : "combat-reward-upgrade"
        });
        if (rewards.money > 0) {
            options.push({
                text : `Gain ${rewards.money} money`,
                onSelect : "combat-reward-money",
                args : rewards.money
            });
        }
        if (rewards.heal > 0) {
            options.push({
                text : `Heal ${rewards.heal} HP`,
                onSelect : "combat-reward-heal",
                args : rewards.heal
            });
        }
        options.push({
            text : "Continue...",
            onSelect : "_next-event"
        });

        ui.setupDynamicEvent({
            prompt : `${enemy.name} has been defeated! Collect your rewards...`,
            options
        })
        this.combatPhaseIndex = null;
        //director.signal("enemy-defeated", rewards);
    }

    playerDefeated() {

    }

    // called by director to start combat
    beginCombat(enemy) {
        this.combatPhaseIndex = COMBAT_PHASES.length - 1; // PLAYER_PRE_TURN
        this.handleTurn();
    }

    calculateAttackResult(letters) {
        let damage = 0;
        let chargeGain = 0;
        let multipliers = [];
        let playerEffects = [];
        let enemyEffects = [];
        let length = Letter.countTrueLength(letters);

        let specialTiles = {};
        let confusedDamage;
        if (player.isConfused) {
            // randomize damage values
            confusedDamage = Utils.shuffleObject(LETTER_DAMAGE_VALUES);
        }
        for (const o of Object.values(SPECIAL_TILE_TYPES)) {
            specialTiles[o] = 0;
        }
        for(const l of letters) {
            for (const l2 of l.letter) { // count raw damage
                chargeGain++;
                if (player.isConfused) {
                    damage += confusedDamage[l2];
                } else {
                    damage += LETTER_DAMAGE_VALUES[l2]
                }
            }
            if (l.specialTileType) { // count no. of special tiles
                specialTiles[l.specialTileType] += 1;
            }
        }
        console.log(specialTiles);
        for (const s in specialTiles) { // handle special tiles
            for (let i = 0; i < specialTiles[s]; i++) {
                switch(s) {
                    case SPECIAL_TILE_TYPES.TYPE_1 : {
                        multipliers.push(1.2);
                        chargeGain += 2;
                        if (relicHandler.checkHasRelic(RELIC_ID.HEAVY_METAL)) {
                            enemyEffects.push({
                                effectType : Effect.EFFECT_TYPES.POISON,
                                value : 0.3 * damage
                            })
                        }
                        break;
                    }
                    case SPECIAL_TILE_TYPES.TYPE_2 : {
                        multipliers.push(1.5);
                        chargeGain += 4;
                        if (relicHandler.checkHasRelic(RELIC_ID.HEAVY_METAL)) {
                            enemyEffects.push({
                                effectType : Effect.EFFECT_TYPES.POISON,
                                value : 0.5 * damage
                            });
                        }
                        break;
                    }
                    default : {
                        console.log(typeof s)
                    }
                }
            }
        }
        // bonus multiplier for long words
        multipliers.push(LENGTH_DAMAGE_MULTIPLIERS[length]); 
        // handle effects
        if (player.effects[Effect.EFFECT_TYPES.WEAKNESS]) multipliers.push(0.5);
        for(const m of multipliers) {
            damage *= parseFloat(m);
        }
        damage = Utils.roundToOneDP(damage);

        if (player.isSilenced) damage = 0;
        // handle charge gain
        
        return {
            damage : damage,
            playerEffects,
            enemyEffects,
            length,
            chargeGain : chargeGain
        };
    }

    specialTilesToGenerate(letters) {
        let output = {};
        let length = Letter.countTrueLength(letters);
        for (const s of Object.values(SPECIAL_TILE_TYPES)) {
            output[s] = 0;
        }

        if (length >= 7) {
            output[SPECIAL_TILE_TYPES.TYPE_2] += 1;
        } else if (length >= 5) {
            output[SPECIAL_TILE_TYPES.TYPE_1] += 1;
        } else {

        }
        return output;
    }
}