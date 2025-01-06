class RelicHandler {
    static getRandomRelic(alreadyHave) {
        // remove the relics that are already present
        let commonRelics = {};
        Object.assign(copy, commonRelics);
    
        for(const r in commonRelics) {
            if (alreadyHave.has(commonRelics[r])) {
                commonRelics[r] = undefined;
            }
        }
    
        //random relic from everything left
        let relicKeys = Object.keys(commonRelics);
        return commonRelics[relicKeys[ relicKeys.length * Math.random() << 0 ]];
    }

    constructor() {
        this.ownedRelics = {};
    }

    _updateRelicDisplay() {
        UI.Relic.updateDisplay();
    }

    addRelic(relicId) {
        if(this.checkHasRelic(relicId)) return false;
        this.ownedRelics[relicId] = RelicFactory.generateRelic(relicId);
        let returnState = this.ownedRelics[relicId].onObtain();
        log(`Added relic ${this.ownedRelics[relicId].name} to inventory`);
        this._updateRelicDisplay();
        if (returnState != undefined) return returnState;
        return true;
    }

    removeRelic(relicId) {
        this.ownedRelics[relicId].onRemove();
        return this.ownedRelics.delete(relicId);
    }

    getOwnedRelics() {
        return this.ownedRelics;
    }

    get ownedRelicsArr() {
        return Object.values(this.ownedRelics);
    }

    checkHasRelic(relicId) {
        return Object.hasOwn(this.ownedRelics, relicId);
    }

    getRelic(relicId) {
        if (this.checkHasRelic(relicId)) {
            return this.ownedRelics[relicId]
        } else return null;
    }
}

const RELIC_ID = {
    // common relics
    HAMMER : "R|HAMMER",
    SHINY_HAMMER : "R|SHINY_HAMMER",
    PEN_NIB : "R|PEN_NIB",
    HEAVY_METAL : "R|HEAVY_METAL",
    COIN : "R|COIN",
    LIGHTSTICK : "R|LIGHTSTICK",
    T_UPGRADE_3 : "R|T_U_3",
    T_CHARGE_HEAL : "R|T_C_H",
    T_MORE_REROLLS : "R|T_M_R",
    T_FIRST_WORD_DOUBLE : "R|T_F_W_D",
    T_BETTER_REROLL_GEN : "R|T_B_R_G",

    // uncommon relics
    ANTIQUE_CLOCK : "R|ANTIQUE_CLOCK",
    LILY : "R|LILY",
    PERPETUAL_MOTION_MACHINE : "R|PERPETUAL_MOTION_MACHINE",
    QUILL : "R|QUILL",
    SPECTACLES : "R|SPECTACLES",
    BASKET : "R|BASKET",
    LENS : "R|LENS",
    SHANK : "R|SHANK",
    SYRINGE : "R|SYRINGE",
    CACTUS : "R|CACTUS",
    MEGAPHONE : "R|MEGAPHONE",
    T_GEM_LOW_THRESH : "R|G_L_T",
    T_POISON_ONE_LETTER : "R|T_P_O_L",

    // rare relics
    GAUNTLET : "R|GAUNTLET",
    ANCIENT_TOME : "R|ANCIENT_TOME",
    T_LONG_MULTIPLIER : "R|T_L_M",
    T_SHORT_WORD_DOUBLE : "R|T_S_W_D",
    T_SHORT_WORD_CHARGE : "R|T_S_W_C"
}

class GenericRelic { // for relics that don't need any internal logic
    constructor(data) {
        this.id = data.id;
        this.name = data.name;
        this.sprite = data.sprite;
        this.value = data.value;
        this.tooltipDescription = data.tooltipDescription;
        this.onObtain = data.onObtain || this.onObtain;
        this.onRemove = data.onRemove || this.onRemove;
        this._modifyDisplay = data.modifyDisplay || this._modifyDisplay;
        this._update = data.update || this._update;
        this.shopCost = data.shopCost || 100;
    }

    update(data) {
        this._update(this, data);
        UI.Relic.updateSingleRelic(this);
    }
    modifyDisplay(element) {return this._modifyDisplay(this, element)}
    onObtain() {}
    onRemove() {}
    
    isActive = false
    _modifyDisplay(ref, element) {
        if (ref.isActive) {
            element.addClass("relic-active-highlight");
        }
        return element;
    }
    _update(ref, isActive) {
        ref.isActive = isActive;
        UI.Ability.updateDisplay(player);
    }

    // following methods should really only be defined in child classes
    handleWord(word) {} // this is called on all owned relics after word is submitted
    checkWordBonus(word) {} // checks if word will trigger relic bonus
    validWordBypass = null; // if true, the word will be counted as valid, bypassing all other logic

    generateElement(isShopDisplay) {
        let relicContainer = $("<div>");
        relicContainer.addClass("relic-container hover-tooltip");
        relicContainer.attr("data-tooltip-content", `${this.name}\n-------\n${this.tooltipDescription}`);
        relicContainer.attr("data-relic-id", this.id)
        let relicSprite = $("<img>");
        relicSprite.addClass("relic-sprite");
        relicSprite.attr("src", this.sprite);
        
        let relicText = $("<div>");
        relicText.addClass("relic-text");
        relicText.text(this.value);

        let relicName;
        let relicCost;
        if (isShopDisplay) {
            relicContainer.addClass("item-container");
            relicContainer.removeClass("relic-container");
            relicSprite.addClass("item-sprite");
            relicSprite.removeClass("relic-sprite");

            relicCost = $("<div>");
            relicCost.addClass("item-cost");
            relicCost.text(this.shopCost);
            relicName = $("<div>")
            relicName.addClass("item-name");
            relicName.text(this.name);
        }

        relicContainer.append(relicName, relicSprite, relicText, relicCost);
        if (!isShopDisplay) relicContainer = this.modifyDisplay(relicContainer);
        return relicContainer;
    }
}

class MegaphoneRelic extends GenericRelic {
    constructor() {
        super({
            id : RELIC_ID.MEGAPHONE,
            name : "Megaphone",
            sprite : "./sprites/relics/Megaphone.png",
            update : (ref, isValid) => {
                this.isValid = isValid;
            },
            modifyDisplay : (ref, element) => {
                if (this.isValid) {
                    element.addClass("relic-active-highlight");
                }
                return element;
            },
            tooltipDescription : "A string of the same letter is now considered a valid word"
        })
    }    
    
    

    checkWordBonus(word) {
        if (word.length < 3) return;
        let letter = word.substring(0,1);
        let isValid = true;
        for(const l of word) {
            if (l != letter) {
                isValid = false;
                break;
            }
        }
        this.validWordBypass = isValid;
        this.update(isValid);
    }
}

class PenNibRelic extends GenericRelic {
    constructor() {
        super({
            id : RELIC_ID.PEN_NIB,
            name : "Pen nib",
            sprite : "./sprites/relics/PenNib.png",
            update : (ref) => {
                this.value++;
            },
            modifyDisplay : (ref, element) => {
                if (this.value == this.ACTIVE_THRESHOLD) {
                    element.addClass("relic-active-highlight");
                }
                return element;
            }
        });
        this.tooltipDescription = `Every ${this.ACTIVE_THRESHOLD} attacks, double the damage.`
        this.value = 1;
    }

    ACTIVE_THRESHOLD = 6

    handleWord(word) {
        this.update(); // add counter by one every time a word is played
    }
    get isActive() {
        return this.value > this.ACTIVE_THRESHOLD;
    }
    reset() {
        this.value = 1;
        UI.Relic.updateSingleRelic(this);
    }
}

class ChargeHealRelic extends GenericRelic {
    constructor() {
        super({
            id : RELIC_ID.T_CHARGE_HEAL,
            name : "Temp | Charge Heal",
            sprite : "./sprites/Questionmorks.png",
            update : (ref, value) => {
                ref.value += value;
                while (ref.checkTrigger()) {
                    player.healDamage(ref.healAmount);
                    ref.value -= ref.ACTIVE_THRESHOLD;
                    log(`Triggered ${ref.name}, healed for ${ref.healAmount} HP.`)
                }
            },
        });
        this.tooltipDescription = `Every 10 Charge spent, heal ${this.healAmount} HP.`;
    }

    healAmount = 1
    value = 0
    ACTIVE_THRESHOLD = 10

    get isActive() {
        return this.value >= this.ACTIVE_THRESHOLD;
    }

    checkTrigger() {
        return this.value >= this.ACTIVE_THRESHOLD;
    }

    reset() {
        this.value = 0;
        UI.Relic.updateSingleRelic(this);
    }
}

class AdditionalRerollOnWordPlayedRelic extends GenericRelic {
    constructor() {
        super({
            id : RELIC_ID.T_BETTER_REROLL_GEN,
            name : "Temp | Better reroll gen",
            sprite : "./sprites/Questionmorks.png",
            update : (ref, value) => {
                this.value++;
                if (this.checkTrigger()) {
                    combatHandler.rerollsLeft += 1;
                    log(`Gained an additional reroll off ${this.name}`)
                    this.reset();
                }
            },
            modifyDisplay : (ref, element) => {
                if (this.value == this.ACTIVE_THRESHOLD) {
                    element.addClass("relic-active-highlight");
                }
                return element;
            },
        })
    }

    ACTIVE_THRESHOLD = 2
    value = 1

    handleWord() {
        this.update();
    }

    get isActive() {
        return this.value > this.ACTIVE_THRESHOLD
    }
    checkTrigger() {
        return this.value > this.ACTIVE_THRESHOLD;
    }
    reset() {
        this.value = 1;
        UI.Relic.updateSingleRelic(this);
    }
}

class RelicFactory {
    static generateRelic(relicId) {
        switch(relicId) {
            case RELIC_ID.HEAVY_METAL : {
                return new GenericRelic({
                    id : relicId,
                    name : "Heavy Metal",
                    sprite : "./sprites/relics/Poison.png",
                    tooltipDescription : "Gems now deal a portion of the word's damage as additional poison damage.\n Purple -> 0.3x, Blue -> 0.5x"
                });
            }
            case RELIC_ID.ANTIQUE_CLOCK : {
                return new GenericRelic({
                    id : relicId,
                    name : "Lived in the Past",
                    sprite : "./sprites/relics/AntiqueClock.png",
                    tooltipDescription : "\"ED\" tiles have a chance to spawn",
                    onObtain : () => {
                        LETTER_PROBABILITY_POINTS["ed"] = 10;
                        Letter.calculateLetterProbabilityThresholds(); 
                    }
                });
            }
            case RELIC_ID.LILY : {
                return new GenericRelic({
                    id : relicId,
                    name : "Lily",
                    sprite : "./sprites/relics/Lily.png",
                    tooltipDescription : "\"LY\" tiles have a chance to spawn",
                    onObtain : () => {
                        LETTER_PROBABILITY_POINTS["ly"] = 10;
                        Letter.calculateLetterProbabilityThresholds();
                    }
                })
            }
            case RELIC_ID.PERPETUAL_MOTION_MACHINE : {
                return new GenericRelic({
                    id : relicId,
                    name : "Perpetual Motion Machine",
                    sprite : "./sprites/relics/PerpetualMotionMachine.png",
                    tooltipDescription : "\"ING\" tiles have a chance to spawn",
                    onObtain : () => {
                        LETTER_PROBABILITY_POINTS["ing"] = 10;
                        Letter.calculateLetterProbabilityThresholds();
                    },
                    onRemove : () => {
                        delete LETTER_PROBABILITY_POINTS["ing"];
                        Letter.calculateLetterProbabilityThresholds();
                    }
                });
            }
            case RELIC_ID.QUILL : {
                return new GenericRelic({
                    id : relicId,
                    name : "Quill",
                    sprite : "./sprites/relics/InkNQuilt.png",
                    tooltipDescription : "\"Q\" tiles are replaced with \"QU\" tiles instead",
                    onObtain : () => {
                        LETTER_PROBABILITY_POINTS["qu"] = LETTER_PROBABILITY_POINTS["q"];
                        delete LETTER_PROBABILITY_POINTS["q"];
                        Letter.calculateLetterProbabilityThresholds();
                    },
                    onRemove : () => {
                        LETTER_PROBABILITY_POINTS["q"] = LETTER_PROBABILITY_POINTS["qu"];
                        delete LETTER_PROBABILITY_POINTS["qu"];
                        Letter.calculateLetterProbabilityThresholds();
                    }
                })
            }
            case RELIC_ID.SPECTACLES : {
                return new GenericRelic({
                    id : relicId,
                    name : "Empty Headed",
                    sprite : "./sprites/relics/Specs.png",
                    tooltipDescription : "Blank tiles now have a low chance to spawn",
                    onObtain : () => {
                        LETTER_PROBABILITY_POINTS["?"] = 5;
                        Letter.calculateLetterProbabilityThresholds();
                    },
                    onRemove : () => {
                        delete LETTER_PROBABILITY_POINTS["?"];
                        Letter.calculateLetterProbabilityThresholds();
                    }
                })
            }
            case RELIC_ID.BASKET : {
                return new GenericRelic({
                    id : relicId,
                    name : "Extra Tile",
                    sprite : "./sprites/relics/Basket.png",
                    tooltipDescription : "+1 Max Tiles",
                    onObtain : () => {
                        GAME_CONSTANTS.STARTING_LETTER_COUNT += 1;
                        Letter.generateLetters();
                    },
                    onRemove : () => {
                        GAME_CONSTANTS.STARTING_LETTER_COUNT -= 1;
                    }
                })
            }
            case RELIC_ID.GAUNTLET : {
                return new GenericRelic({
                    id : relicId,
                    name : "Gauntlet",
                    sprite : "./sprites/relics/Gauntlet.png",
                    tooltipDescription : "Max tiles +3, but you gain half the amount of charge",
                    onObtain : () => {
                        GAME_CONSTANTS.STARTING_LETTER_COUNT += 3;
                        Letter.generateLetters();
                    },
                    onRemove : () => {
                        GAME_CONSTANTS.STARTING_LETTER_COUNT -= 3;
                    }
                })
            }
            case RELIC_ID.SHANK : {
                return new GenericRelic({
                    id : relicId,
                    name : "Shank",
                    sprite : "./sprites/relics/Shank.png",
                    tooltipDescription : "Words < 5 in length give charge as if they were 5 characters long",
                });
            }
            case RELIC_ID.LENS : {
                return new GenericRelic({
                    id : relicId,
                    name : "Lens",
                    sprite : "./sprites/relics/Lens.png",
                    tooltipDescription : "Gems give more charge when played"
                });
            }
            case RELIC_ID.ANCIENT_TOME : {
                return new GenericRelic({
                    id : relicId,
                    name : "Ancient Tome",
                    sprite : null,
                    tooltipDescription : "Charge Gain x2, but Max Tiles - 2",
                    onObtain : () => {
                        GAME_CONSTANTS.STARTING_LETTER_COUNT -= 2;
                    },
                    onRemove : () => {
                        GAME_CONSTANTS.STARTING_LETTER_COUNT += 2;
                    }
                })
            }
            case RELIC_ID.SYRINGE : {
                let r = new GenericRelic({
                    id : relicId,
                    name : "Syringe",
                    sprite : "./sprites/relics/srynge.png",
                    tooltipDescription : "The first charge ability per combat costs half",
                });
                r.isActive = true;
                return r;
            }
            case RELIC_ID.PEN_NIB : {
                return new PenNibRelic();
            }
            case RELIC_ID.CACTUS : {
                return new GenericRelic({
                    id : relicId,
                    name : "Cactus",
                    sprite : "./sprites/relics/Cactus.png",
                    tooltipDescription : "When playing a word <= 5 characters, generate an extra tile",
                })
            }
            case RELIC_ID.MEGAPHONE : {
                return new MegaphoneRelic();
            }
            case RELIC_ID.COIN : {
                return new GenericRelic({
                    id : relicId,
                    name : "Coin",
                    sprite : "./sprites/relics/Coin.png",
                    tooltipDescription : "The first refresh each combat does not skip your turn",
                });
            }
            case RELIC_ID.LIGHTSTICK : {
                return new GenericRelic({
                    id : relicId,
                    name : "Lightstick",
                    sprite : "./sprites/relics/Lightstick.png",
                    tooltipDescription : "Companions deal 1.5x damage"
                });
            }
            case RELIC_ID.HAMMER : {
                return new GenericRelic({
                    id : relicId,
                    name : "Hammer",
                    sprite : "./sprites/Questionmorks.png",
                    tooltipDescription : "Base damage is slightly increased"
                });
            }
            case RELIC_ID.SHINY_HAMMER : {
                return new GenericRelic({
                    id : relicId,
                    name : "Shiny Hammer",
                    sprite : "./sprites/Questionmorks.png",
                    tooltipDescription : "Gems have a slightly increased damage multiplier"
                })
            }
            case RELIC_ID.T_CHARGE_HEAL : {
                return new ChargeHealRelic();
            }
            case RELIC_ID.T_FIRST_WORD_DOUBLE : {
                return new GenericRelic({
                    id : relicId,
                    name : "Temp | First word double",
                    sprite :"./sprites/Questionmorks.png",
                    tooltipDescription : "The first word played each combat deals double damage"
                });
            }
            case RELIC_ID.T_MORE_REROLLS : {
                return new GenericRelic({
                    id : relicId,
                    name : "Temp | More rerolls",
                    sprite : "./sprites/Questionmorks.png",
                    tooltipDescription : "Increases the max rerolls count by 3",
                    onObtain : () => {
                        combatHandler.maxRerolls += 3;
                    },
                    onRemove : () => {
                        combatHandler.maxRerolls -= 3;
                    }
                })
            }
            case RELIC_ID.T_BETTER_REROLL_GEN : {
                return new AdditionalRerollOnWordPlayedRelic();
            }
            case RELIC_ID.T_LONG_MULTIPLIER : {
                return new GenericRelic({
                    id : relicId,
                    name : "Temp | Long word multipler",
                    sprite : "./sprites/Questionmorks.png",
                    tooltipDescription : "Words longer > 5 letters have an increased multiplier. However, set rerolls to 0 on obtaining this relic.",
                    onObtain : () => {
                        combatHandler.maxRerolls = 0;
                        combatHandler.rerollsLeft = 0;
                    }
                });
            }
            case RELIC_ID.T_SHORT_WORD_DOUBLE : {
                return new GenericRelic({
                    id : relicId,
                    name : "Temp | Short word double",
                    sprite : "./sprites/Questionmorks.png",
                    tooltipDescription : "Words < 5 in length deal double damage"
                });
            }
            case RELIC_ID.T_SHORT_WORD_CHARGE : {
                return new GenericRelic({
                    id : relicId,
                    name : "Temp | Short word charge",
                    sprite : "./sprites/Questionmorks.png",
                    tooltipDescription : "Word < 5 in length give double the amount of charge"
                })
            }
            case RELIC_ID.T_GEM_LOW_THRESH : {
                return new GenericRelic({
                    id : relicId,
                    name : "Temp | Lower gem threshold",
                    sprite : "./sprites/Questionmorks.png",
                    tooltipDescription : "Gems now have a lower theshold to spawn"
                })
            }
            case RELIC_ID.T_UPGRADE_3 : {
                return new GenericRelic({
                    id : relicId,
                    name : "Temp | Upgrade 3 random",
                    sprite : "./sprites/Questionmorks.png",
                    tooltipDescription : "When obtained, upgrade the damage of 3 random letters",
                    onObtain : () => {
                        let randomLetters = _.sampleSize(Letter.ALPHABET_SET, 3);
                        for (const l of randomLetters) {
                            letterModifierHandler.addModifierFromId(l, MODIFIER_ID.DAMAGE_INCREASE);
                        }
                    }
                })
            }
            case RELIC_ID.T_POISON_ONE_LETTER : {
                return new GenericRelic({
                    id : relicId,
                    name : "Temp | Poison one letter",
                    sprite : "./sprites/Questionmorks.png",
                    tooltipDescription : "When obtained, pick a letter. All future tiles of that letter are now poisoned",
                    onObtain : () => {
                        UI.Letter.singleLetterPickerSelector("Pick a letter to poison", (l) => {
                            letterUpgrades[l].push(new PoisonLetterUpgrade());
                        }, false);
                        return false;
                    }
                })
            }
            default : {
                throw new Error("No relic found! Did you forget to add it to the Factory class?")
            }
        }
    }

    static getRandomUnownedRelic(amount) {
        let relics = [];
        relics.push(RELIC_ID.T_POISON_ONE_LETTER);
        while(relics.length < amount) {
            let relicId = _.sample(Object.values(RELIC_ID));
            if(!relicHandler.checkHasRelic(relicId) && !relics.includes(relicId)) {
                relics.push(relicId);
            }
        }
        relics = relics.map((relicId) => {
            return RelicFactory.generateRelic(relicId);
        })
        return relics;
    }
}
