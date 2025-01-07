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
var letterChargeBonus = {
    "a" : 0,
    "b" : 0,
    "c" : 0,
    "d" : 0,
    "e" : 0,
    "f" : 0,
    "g" : 0,
    "h" : 0,
    "i" : 0,
    "j" : 0,
    "k" : 0,
    "l" : 0,
    "m" : 0,
    "n" : 0,
    "o" : 0,
    "p" : 0,
    "q" : 0,
    "r" : 0,
    "s" : 0,
    "t" : 0,
    "u" : 0,
    "v" : 0,
    "w" : 0,
    "x" : 0,
    "y" : 0,
    "z" : 0
}

// handles combat related things and turn order
class CombatHandler {
    constructor() {
        this.combatPhaseIndex = null
        this._rerollsLeft = 5;
        this.maxRerolls = 5;
    }

    // this function calls resolveTurn. Purpose is to avoid using recurring function calls
    async handleTurn(skipTurn = false) {
        let continueTurn;
        do {
            if (COMBAT_PHASES[this.combatPhaseIndex] == "PLAYER_STANDBY" 
                && player.isStunned) {
                skipTurn = true;
            }
            continueTurn = await this.resolveTurn(skipTurn);
        } while(continueTurn)
    }
    async resolveTurn(skipTurn = false) {
        switch(COMBAT_PHASES[this.combatPhaseIndex]) {
            case "PLAYER_STANDBY" : {
                if (skipTurn) {
                    console.log("Turn skipped");
                    // countdown stun if present
                    player.customResolveEffect(Effect.EFFECT_TYPES.STUN);
                    break;
                } else {
                    await this._playerSubmit();
                    break;
                }
            }
            case "PLAYER_POST_TURN" : {
                await player.resolvePostTurnEffects();
                break;
            }
            case "ENEMY_PRE_TURN" : {
                await currentEnemy.resolvePreTurnEffects();
                break;
            }
            case "ENEMY_ACTION" : {
                if (currentEnemy.isStunned) {
                    currentEnemy.customResolveEffect(Effect.EFFECT_TYPES.STUN);
                    break;
                };
                await currentEnemy.selectAndPerformAttack();
                break;
            }
            case "ENEMY_POST_TURN" : {
                await currentEnemy.resolvePostTurnEffects();
                break;
            }
            case "PLAYER_PRE_TURN" : {
                await player.resolvePreTurnEffects();
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
    async _playerSubmit() {
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
        if (relicHandler.checkHasRelic(RELIC_ID.GAUNTLET)) attackResult.chargeGain /= 2;
        player.gainCharge(attackResult.chargeGain);
        
        // relic effects
        for (const r of relicHandler.ownedRelicsArr) {
            r.handleWord(attackResult.word);
        }
        let pennib = relicHandler.getRelic(RELIC_ID.PEN_NIB);
        if (pennib && pennib.isActive) {
            attackResult.damage *= 2;
            pennib.reset();
        }

        // gain one reroll after every word play
        this.rerollsLeft++;

        // apply effects first
        for (const e of attackResult.effects) {
            e.apply(e)
        }
        // handle damage to enemies
        await currentEnemy.dealDamage(attackResult.damage, true);

        // Companion advancement
        for (const c of companionHandler.companionArr) {
            await c.resolveSubmitWord(attackResult.word);
        } 

        if (!currentEnemy.isAlive) {
            return false; // don't resovle effects if enemy dies early
        } 


        return true;
    }

    enemyDefeated(enemy) {
        // clear status effects from player
        player.removeAllStatuses();
        director.gameState = GAME_CONSTANTS.GAME_STATES.EVENT;

        let rewards = CombatReward.collateRewards(enemy.rewards);

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
        if (rewards.charge > 0) {
            options.push({
                text : `Gain ${rewards.charge} Charge`,
                onSelect : "combat-reward-charge",
                args : rewards.charge
            });
        }
        if (rewards.relic) {
            for (const r of rewards.relic) {
                let rel = RelicFactory.generateRelic(r);
                options.push({
                    text : `Get relic ${rel.name}`,
                    onSelect : "combat-reward-relic",
                    args : rel.id
                })
            }
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
    async beginCombat(enemy) {
        Letter.generateLetters(); // refill the tile board
        this.combatPhaseIndex = COMBAT_PHASES.length - 1; // PLAYER_PRE_TURN
        
        // start of combat relic effects
        let syringeRelic = relicHandler.getRelic(RELIC_ID.SYRINGE);
        if (syringeRelic) syringeRelic.update(true); // enable syringe
        let coinRelic = relicHandler.getRelic(RELIC_ID.COIN);
        if (coinRelic) {
            coinRelic.update(true) // enable coin
            ui.setRefreshButtonText("Refresh");
        }
        let firstWordDoubleRelic = relicHandler.getRelic(RELIC_ID.T_FIRST_WORD_DOUBLE);
        if (firstWordDoubleRelic) firstWordDoubleRelic.update(true);

        // reset reroll count
        this.rerollsLeft = this.maxRerolls;

        // companions entering combat with a full bar attack immediately
        for (const c of companionHandler.companionArr) {
            await c.advanceCounter(0);
        } 

        this.handleTurn();
    }

    calculateAttackResult(letters) {
        let word = ""
        let damage = 0;
        let multipliers = [];
        let length = Letter.countTrueLength(letters);
        let effects = [];

        let specialTiles = {};
        let confusedDamage;
        let cursedCount = 0;
        let extraChargeGainOnGem = (relicHandler.checkHasRelic(RELIC_ID.LENS)) ? 2 : 0;

        if (player.isConfused) {
            // randomize damage values
            confusedDamage = Utils.shuffleObject(LETTER_DAMAGE_VALUES);
        }
        for (const o of Object.values(SPECIAL_TILE_TYPES)) {
            specialTiles[o] = [];
        }
        let individualTileDamage = [];
        let individualTileCharge = [];
        let index = 0;
        let harmonizedLetters = {};
        let emphasizedLetterIndexes = [];
        for(const l of letters) {
            let chargeGain = 0;
            let tileDamage = 0;
            for (const l2 of l.letter) { // count raw damage
                word += l2;
                chargeGain += 1 + letterChargeBonus[l2];
                if (player.isConfused) {
                    tileDamage += confusedDamage[l2];
                } else { // poison does not deal regular damage
                    tileDamage += LETTER_DAMAGE_VALUES[l2]
                }
            }
            if (l.specialTileType) { // count no. of special tiles of each type
                specialTiles[l.specialTileType].push(index);
            }

            // tile effects
            if (l.tileEffects[TILE_EFFECTS.SPIKED]) {
                let damage = l.tileEffects[TILE_EFFECTS.SPIKED].damage;
                player.dealDamage(damage);
                log(`Took ${damage} damage from Spiked Tile!`)
            }
            if (l.tileEffects[TILE_EFFECTS.CURSED]) {
                cursedCount++;
            }
            if (l.tileEffects[TILE_EFFECTS.POISONOUS]) {
                effects.push(AttackEffect.applyStatusEffect("enemy", Effect.EFFECT_TYPES.POISON, tileDamage));
                // poison damage replaces regular damage
                tileDamage = 0;
            }
            if (l.tileEffects[TILE_EFFECTS.HARMONIZED]) {
                for (const l2 of l.letter) { // gotta deal with multi-letter tiles again....
                    if (!Object.hasOwn(harmonizedLetters, l2)) {
                        harmonizedLetters[l2] = false;
                        continue;
                    }
                    if (harmonizedLetters[l2] === false) {
                        harmonizedLetters[l2] = true;
                    }
                }
            }
            if (l.tileEffects[TILE_EFFECTS.EMPHASIZED]) {
                emphasizedLetterIndexes.push(index);
            }
            if (l.tileEffects[TILE_EFFECTS.SUPERCHARGED]) {
                chargeGain *= 2;
            }

            individualTileDamage.push(tileDamage);
            individualTileCharge.push(chargeGain);
            index++;
        }
        for (const s in specialTiles) { // handle special tiles
            for (const i of specialTiles[s]) {
                individualTileCharge[i] += extraChargeGainOnGem;
                let multiplier = 1;
                if (relicHandler.checkHasRelic(RELIC_ID.SHINY_HAMMER)) multiplier += 0.1;
                switch(s) {
                    case SPECIAL_TILE_TYPES.TYPE_1 : {
                        individualTileDamage[i] += 2;
                        individualTileCharge[i] += 2;
                        effects.push(AttackEffect.applyStatusEffect("player", Effect.EFFECT_TYPES.SHIELD, 5))
                        if (relicHandler.checkHasRelic(RELIC_ID.HEAVY_METAL)) {
                            effects.push(AttackEffect.applyStatusEffect("enemy", 
                                Effect.EFFECT_TYPES.POISON, individualTileDamage[i]
                            ))
                        }
                        break;
                    }
                    case SPECIAL_TILE_TYPES.TYPE_2 : {
                        individualTileDamage[i] += 4;
                        individualTileCharge[i] += 4;
                        effects.push(AttackEffect.healEffect("player", 3));
                        if (relicHandler.checkHasRelic(RELIC_ID.HEAVY_METAL)) {
                            effects.push(AttackEffect.applyStatusEffect("enemy", 
                                Effect.EFFECT_TYPES.POISON, individualTileDamage[i]
                            ))
                        }
                        break;
                    }
                    default : {
                        console.log(typeof s)
                    }
                }
                multipliers.push(multiplier);
            }
        }
        
        // deal with harmonized letters
        for (let i = 0; i < letters.length; i++) {
            for (const l2 of letters[i].letter) {
                if (Object.hasOwn(harmonizedLetters, l2) &&
                  harmonizedLetters[l2] === true) {
                    individualTileDamage[i] *= 2;
                  }
            }
        }

        // emphasized tiles
        for (const i of emphasizedLetterIndexes) {
            // double damage of tile
            individualTileDamage[i] *= 2;
            // 1.5x for adjacent tiles
            console.log(typeof individualTileDamage[i])
            if (typeof individualTileDamage[i+1] !== "undefined") {
                individualTileDamage[i+1] *= 1.5;
            }
            if (typeof individualTileDamage[i-1] !== "undefined") {
                individualTileDamage[i-1] *= 1.5;
            }
        }
        console.log(individualTileDamage);

        damage = _.sum(individualTileDamage);
        let chargeGain = _.sum(individualTileCharge);

        // damage related relic effects
        if (relicHandler.checkHasRelic(RELIC_ID.HAMMER)) damage += 3;
        let firstWordDoubleRelic = relicHandler.getRelic(RELIC_ID.T_FIRST_WORD_DOUBLE);
        if (firstWordDoubleRelic) {
            multipliers.push(2);
            firstWordDoubleRelic.update(false);
        }
        if (relicHandler.checkHasRelic(RELIC_ID.T_SHORT_WORD_DOUBLE)
          && length < 5) multipliers.push(2);

        // bonus multiplier for long words
        let lengthBonus = 0;
        if (relicHandler.checkHasRelic(RELIC_ID.T_LONG_MULTIPLIER) && length >= 5) {
            lengthBonus += 0.1 * (length - 4)
        }
        multipliers.push(LENGTH_DAMAGE_MULTIPLIERS[length] + lengthBonus); 

        // handle effects
        if (player.effects[Effect.EFFECT_TYPES.WEAKNESS]) multipliers.push(0.5);
        if (player.effects[Effect.EFFECT_TYPES.DAMAGE_BOOST]) {
            multipliers.push(
              player.effects[Effect.EFFECT_TYPES.DAMAGE_BOOST].value
            );
            player.removeEffect(Effect.EFFECT_TYPES.DAMAGE_BOOST);
        };
        if (cursedCount > 0) {
            multipliers.push(0.5 ** cursedCount);
        }
        for(const m of multipliers) {
            damage *= parseFloat(m);
        }
        damage = Utils.roundToOneDP(damage);

        if (player.isSilenced) damage = 0;

        
        // misc relics stuff
        if (relicHandler.checkHasRelic(RELIC_ID.SHANK) && length < 5) {
            chargeGain += 5 - length;
        }
        if (relicHandler.checkHasRelic(RELIC_ID.ANCIENT_TOME)) {
            chargeGain *= 2;
        }
        if (relicHandler.checkHasRelic(RELIC_ID.T_SHORT_WORD_CHARGE) && length < 5) {
            chargeGain *= 2;
        }
        if (relicHandler.checkHasRelic(RELIC_ID.CACTUS) && length >= 5) {
            effects.push(AttackEffect.generateTileEffect(1));
        }
        
        return {
            word,
            damage,
            effects,
            length,
            chargeGain
        };
    }

    specialTilesToGenerate(letters) {
        let output = {};
        let length = Letter.countTrueLength(letters);
        if (relicHandler.checkHasRelic(RELIC_ID.T_GEM_LOW_THRESH)) length += 1;
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

    // Handling rerolls
    rerollButtonOnClick(e) {
        if (this.rerollsLeft <= 0)  {
            log("No rerolls left!");
            return;
        }
        this.rerollsLeft--;
        UI.Letter.temporaryTileHighlightWithCallback((t, letter) => {
            letter.rerollLetter(t);
        }, "temporary-highlight-ability");
    }

    giveRerolls(value) {
        this.rerollsLeft = this.rerollsLeft + value;
    }

    set rerollsLeft(value) {
        if (value > this.maxRerolls) value = this.maxRerolls;
        if (value < 0) value = 0;
        this._rerollsLeft = value;
        ui.updateRerollCount(this._rerollsLeft);
    }
    get rerollsLeft() {
        return this._rerollsLeft;
    }
}