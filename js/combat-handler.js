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
    "z" : 4
}

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
    handleTurn() {
        let continueTurn;
        do {
            continueTurn = this.resolveTurn();
        } while(continueTurn)
    }
    resolveTurn() {
        switch(COMBAT_PHASES[this.combatPhaseIndex]) {
            case "PLAYER_STANDBY" : {
                this._playerSubmit();
                break;
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
          && COMBAT_PHASES[this.combatPhaseIndex] != "PLAYER_STANDBY";
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
        // replace letters lost
        Letter.generateLetters(GAME_CONSTANTS.STARTING_LETTER_COUNT - 
            UI.Letter.getAvailableLetterElements().length, true, attackResult.length);

        //handle damage to enemies
        let isEnemyDefeated = currentEnemy.dealDamage(attackResult.damage, true);
        if (isEnemyDefeated) {
            return false;
        } 

        // first apply effects
        for (const e of attackResult.playerEffects) {
            switch(e[0]) {
                case Effect.EFFECT_TYPES.POISON : {
                    player.applyEffect(e[0], attackResult.damage * e[1]);
                }
            }
            player.applyEffect(...e);
        }
        for (const e of attackResult.enemyEffects) {
            switch(e[0]) {
                case Effect.EFFECT_TYPES.POISON : {
                    currentEnemy.applyEffect(e[0], attackResult.damage * e[1]);
                }
            };
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
        let multipliers = [];
        let playerEffects = [];
        let enemyEffects = [];
        let length = 0;

        for(const l of letters) {
            for(const l2 of l.letter) {
                length++;
                damage += LETTER_DAMAGE_VALUES[l2];
            }
            switch(l.specialTileType) {
                case SPECIAL_TILE_TYPES.TYPE_1:
                    multipliers.push(1.2);
                    if (relicHandler.checkHasRelic(RELIC_ID.HEAVY_METAL)) {
                        enemyEffects.push([Effect.EFFECT_TYPES.POISON, 0.3])
                    }
                    break;
                case SPECIAL_TILE_TYPES.TYPE_2:
                    multipliers.push(1.5);
                    if (relicHandler.checkHasRelic(RELIC_ID.HEAVY_METAL)) {
                        enemyEffects.push([Effect.EFFECT_TYPES.POISON, 0.3]);
                    }
                    break;
            }
        }
        
        //bonus multiplier for long words
        multipliers.push(LENGTH_DAMAGE_MULTIPLIERS[length]); 
        for(const m of multipliers) {
            damage *= parseFloat(m);
        }
        damage = Utils.roundToHalf(damage);
        return {
            damage : damage,
            playerEffects,
            enemyEffects,
            length
        };
    }
}