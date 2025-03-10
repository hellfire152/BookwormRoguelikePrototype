class Enemy extends Character {
    constructor(data, level) {
        super(); 
        this.name = data.name
        let n = data.baseMaxHP// * (1.15 ** level);
        this.maxHP = Utils.roundToOneDP(n);
        this.currentHP = this.maxHP;
        this.attacks = data.attacks;
        this.state = data.initialState; // a tracking number for any purpose
        this.stateTransition = data.stateTransition;
        this.rewards = data.rewards ? data.rewards : [ // set default reward if not present
            {
                type : "money",
                value : (level) => {
                    return 10 + Math.floor(Math.random() * 5);
                },
                probability : 1
            },
        ];
        this.sprite = data.sprite;
        this.level = level;
        this.tooltip = data.tooltip;
    }

    async selectAndPerformAttack() { // goes through attacks in order by default
        if(this.attacks.length <= 0) {
            throw new Error("No attacks on this enemy!");
        }

        let anim = await Anim.enemyAttack(() => {
            this._performAttack(this.attacks[this.state]);
            this.stateTransition(this);
        });
    }

    _performAttack(attack) {
        // TODO: Say the action in the UI
        log(`${this.name} uses ${attack.name}!`);
        for (const e of attack.effects) {
            e.apply(e);
        }
    }

    defeatAndGiveRewards() {
        log(`${this.name} has been defeated!`);

        combatHandler.enemyDefeated(this);
    }

    async dealDamage(damage, isDirect, type) {
        let result = super.dealDamage(damage);
        if (this.isAlive) {
            await Anim.enemyReceiveDamage(damage, type);
        } else {
            await Anim.enemyDeath();
        }
        
        isDirect && log(`Player dealt ${result.damage} damage to ${this.name}`);

        if (!this.isAlive) {
            this.defeatAndGiveRewards();
        }
        return result;
    }

    _updateHPDisplay() {
        UI.Enemy.updateHPDisplay(this)
    }

    _updateEffectDisplay() {
        UI.Enemy.updateStatusDisplay(this.getStatuses());
    }

    initializeDisplay() {
        UI.Enemy.initializeEnemyDisplay(this);
    }

    calculateAttackBonus() {} // implement enemy-specific bonuses here
}

const ENEMY_ID = {
    GOBBO : "E_001",
    GHOST : "E_002",
    SLIME : "E_003",
    SNEK : "E_004",
    PIG_BOSS : "E|PIG_BOSS",
    SUCCUBUS : "E|SUCCUBUS",
    NORMAL_BIRD : "E|NORMAL_BIRD",
    MR_ROACH : "E|ROACH",
    SPOODER : "E|SPOODER",
    MIMIC : "E|MIMIC",
    DICE : "E|DICE",
    PROTOTYPE_END_BOSS : "E|PROTOTYPE_END_BOSS"
}
const ENEMIES = {
    [ENEMY_ID.GOBBO] : {
        name : "gobbo",
        baseMaxHP : 10,
        attacks : [
            {
                name : "Gobbo punch",
                effects : [
                    AttackEffect.damageEffect("player", 3)
                ]
            },
            {
                name : "Gobbo Slam",
                effects : [
                    AttackEffect.damageEffect("player", 5),
                ]
            }
        ],
        initialState : 0,
        stateTransition : (ref) => {
            if (++ref.state >= 2) {
                ref.state = 0
            }
        },
        rewards : [
            CombatReward.money((level) => {
                return 10 + Math.floor(Math.random() * 5);
            })
        ],
        sprite : "./sprites/enemies/Goblin.png",
        tooltip : "Gobbo gobbin Good"
    },
    [ENEMY_ID.GHOST] : {
        name : "ghooost",
        baseMaxHP : 15,
        attacks : [
            {
                name : "boo!",
                effects : [
                    AttackEffect.replacementEffect(AttackEffect.TYPES.RANDOM_REPLACEMENT,
                        2, () => {
                            let r = Math.random() < 0.5;
                            return (r) ? "o" : "u"
                        }
                    ),
                    AttackEffect.damageEffect("player",5)
                ]
            }
        ],
        initialState : 0,
        stateTransition : () => {
            return 0;
        },
        rewards : [CombatReward.money(8)],
        sprite : "./sprites/enemies/Ghost.png",
        tooltip : "Hobbies include making your pillow slightly too cold when you sleep."
    },
    [ENEMY_ID.SLIME] : {
        name : "Slime",
        baseMaxHP : 10,
        attacks : [
            {
                name : "Consume",
                effects : [
                    AttackEffect.destroyTileEffect(1),
                    AttackEffect.damageEffect("player", 5),
                    AttackEffect.healEffect("enemy", 2)
                ]
            },
        ],
        initialState : 0,
        stateTransition : (ref) => {
            return ref.state;
        },
        rewards : [CombatReward.money(12), CombatReward.heal(3)],
        sprite : "./sprites/enemies/Slime.png",
        tooltip : "Perpetually hungry"
    },
    [ENEMY_ID.SNEK] : {
        name : "Snek",
        baseMaxHP : 89,
        attacks : [
            {
                name : "Apply Venom",
                effects : [
                    AttackEffect.damageEffect("player", 2),
                    AttackEffect.applyStatusEffect("player", Effect.EFFECT_TYPES.SNAKE_VENOM, 1)
                ]
            },
            {
                name : "Tail Whip",
                effects : [
                    AttackEffect.damageEffect("player",  5),
                    AttackEffect.destroyTileEffect(2)
                ]
            },
            {
                name : "Constrict",
                effects : [
                    AttackEffect.damageEffect(3),
                    AttackEffect.applyStatusEffect("player", Effect.EFFECT_TYPES.WEAKNESS, 1)
                ]
            },
            {
                name : "Bite", 
                effects : [
                    AttackEffect.damageEffect(1),
                    AttackEffect.applyStatusEffect("player", Effect.EFFECT_TYPES.SNAKE_VENOM, 2)
                ]
            }
        ],
        initialState : 0,
        stateTransition : (ref) => {
            if (++ref.state > 3) {
                ref.state = 1;
            }
        },
        rewards : [CombatReward.money(20), CombatReward.relic(null)],
        sprite : "./sprites/enemies/Snek.png",
        tooltip : "Deals poison damage that deals increasing damage over time"
    },
    [ENEMY_ID.PIG_BOSS] : {
        name : "General Manager",
        baseMaxHP : 150,
        attacks : [
            {
                name : "Smite",
                effects : [
                    AttackEffect.damageEffect("player", 5),
                    AttackEffect.applyTileEffect(TILE_EFFECTS.MONEY_LOCK, (letters) => {
                        return _.sampleSize(letters, 3);
                    }, {cost : 5, duration : 2})
                ]
            },
            {
                name : "Extort",
                effects : [
                    AttackEffect.damageEffect("player", 3),
                    AttackEffect.stealMoneyEffect(5)
                ]
            },
            {
                name : "Accost",
                effects : [
                    AttackEffect.damageEffect("player", 3),
                    AttackEffect.applyStatusEffect("player", Effect.EFFECT_TYPES.VULNERABLE, 2)
                ]
            },
            {
                name : "Cash Out!",
                effects : [
                    AttackEffect.damageEffect("player", 10),
                ]
            }
        ],
        initialState : 0,
        stateTransition : (ref) => {
            let greedEffect = ref.getStatus(Effect.EFFECT_TYPES.GREED);
            if (greedEffect && greedEffect.value >= 25) {
                ref.state = 3 // use Cash Out
                return;
            }
            if (++ref.state > 2) {
                ref.state = 0
            }
        },
        rewards : [CombatReward.money(50), CombatReward.relic(null,null,"rare"), CombatReward.heal(999)],
        sprite : "./sprites/enemies/Pig.png",
        tooltip : "Forces you to pay for certain tiles. He gains a greed stack for every money spent.\nAt 25 Greed stacks, uses a powerful attack."
    },
    [ENEMY_ID.SUCCUBUS] : {
        name : "Succubus",
        baseMaxHP : 80,
        attacks : [
            {
                name : "Whip",
                effects : [
                    AttackEffect.damageEffect("player", 7),
                    AttackEffect.applyTileEffect(TILE_EFFECTS.SPIKED, (letters) => {
                        return _.sampleSize(letters, 3);
                    }, {damage: 5, duration : 3})
                ]
            },
            {
                name : "Seduce",
                effects : [
                    AttackEffect.damageEffect("player", 3),
                    AttackEffect.applyTileEffect(TILE_EFFECTS.COMPELLED, (letters) => {
                        return _.sampleSize(letters, 2);
                    }, {duration : 1}),
                    AttackEffect.applyStatusEffect("player", Effect.EFFECT_TYPES.WEAKNESS, 1)
                ]
            },
            {
                name : "Expose",
                effects : [
                    AttackEffect.damageEffect("player", 5),
                    AttackEffect.applyTileEffect(TILE_EFFECTS.COMPELLED, (letters) => {
                        return _.sampleSize(letters, 3);
                    }, {duration : 1}),
                    AttackEffect.applyStatusEffect("enemy", Effect.EFFECT_TYPES.VULNERABLE, 1)
                ]
            }
        ],
        initialState : 0,
        stateTransition : (ref) => {
            if (++ref.state > 2) {
                ref.state = 0;
            }
        },
        rewards : [CombatReward.money(50), CombatReward.relic(null,null,"rare")],
        sprite : "./sprites/enemies/Lady.png",
        tooltip : "Forces you to make tough decisions with your tiles.\nCan apply spiked tile effect, deals 5 damage to you if you use it.\nCan also apply compelled tile effect, which forces you to use that tile."
    },
    [ENEMY_ID.PROTOTYPE_END_BOSS] : {
        name : "Prototype Boss",
        baseMaxHP : 9999,
        attacks : [
            {
                name : "Attack",
                effects : [
                    AttackEffect.damageEffect("player", (enemy) => {
                        if (!enemy.attackLevel) {
                            enemy.attackLevel = 0;
                        }
                        return 5 + (enemy.attackLevel++ * 3);
                    })
                ]
            }
        ],
        initialState : 0,
        stateTransition : (ref) => {ref.state = 0},
        rewards : [],
        sprite : "./sprites/enemies/MC.png",
        tooltip : "Supposededly unwinnable fight. See how far you can make it!"
    },
    [ENEMY_ID.NORMAL_BIRD] : {
        name : "Normal Bird",
        baseMaxHP : 60,
        attacks : [
            {
                name : "ALERT",
                effects : [
                    AttackEffect.damageEffect(2),
                    AttackEffect.applyTileEffect(TILE_EFFECTS.CHARGE_LOCK, (letters) => {
                        return _.sampleSize(letters, 2)
                    }, {duration : 2})
                ]
            },
            {
                name : "P-E-E-E-ECK",
                effects : [
                    AttackEffect.damageEffect(3),
                    AttackEffect.damageEffect(3),
                    AttackEffect.damageEffect(3),
                    AttackEffect.damageEffect(3)
                ]
            }
        ],
        initialState : 0,
        stateTransition : (ref) => {
            if (++ref.state > 1) {
                ref.state = 0;
            }
        },
        rewards : [CombatReward.money(20), CombatReward.charge(10)],
        sprite : "./sprites/enemies/Bird.png",
        tooltip : "This is a very normal bird. Move along."
    },
    [ENEMY_ID.MR_ROACH] : {
        name : "Mr. Roach",
        baseMaxHP : 50,
        attacks : [
            {
                name : "Spook",
                effects : [
                    AttackEffect.damageEffect(5),
                    AttackEffect.applyTileEffect(TILE_EFFECTS.CURSED, (letters) => {
                        return _.sampleSize(letters, 2)
                    }, {duration : 1})
                ]
            },
            {
                name : "Lecture",
                effects : [
                    AttackEffect.damageEffect(6),
                    AttackEffect.applyStatusEffect("player", Effect.EFFECT_TYPES.WEAKNESS, 2)
                ]
            }
        ],
        initialState : 0,
        stateTransition : (ref) => {
            if (++ref.state > 1) {
                ref.state = 0;
            }
        },
        rewards : [CombatReward.money(10)],
        sprite : "./sprites/enemies/Cockroach.png",
        tooltip : "Will get triggered if you touch him."
    },
    [ENEMY_ID.SPOODER] : {
        name : "Spooder",
        baseMaxHP : 50,
        attacks : [
            {
                name : "Entangle",
                effects : [
                    AttackEffect.damageEffect(5),
                    AttackEffect.applyTileEffect(TILE_EFFECTS.LOCK, (letters) => {
                        return _.sampleSize(letters, 2)
                    }, {duration : 2})
                ]
            },
            {
                name : "Bite",
                effects :  [
                    AttackEffect.damageEffect(2),
                    AttackEffect.applyStatusEffect("player", Effect.EFFECT_TYPES.POISON, 5)
                ]
            }
        ],
        initialState : 0,
        stateTransition : (ref) => {
            if (++ref.state > 1) {
                ref.state = 0
            }
        },
        rewards : [CombatReward.money(15)],
        sprite : "./sprites/enemies/Spider.png",
        tooltip : "Will lock your tiles and poison you. Don't get caught for too long!"
    },
    [ENEMY_ID.MIMIC] : {
        name : "Mimic",
        baseMaxHP : 65,
        attacks : [
            {
                name : "Entrap",
                effects : [
                    AttackEffect.damageEffect(4),
                    AttackEffect.applyTileEffect(TILE_EFFECTS.CURSED, (letters) => {
                        return _.sampleSize(2)
                    }, {duration : 1})
                ]
            },
            {
                name : "Bite",
                effects : [
                    AttackEffect.damageEffect(6),
                    AttackEffect.damageEffect(8)
                ]
            }
        ],
        initialState : 0,
        stateTransition : (ref) => {
            if (++ref.state > 1) {
                ref.state = 0
            }
        },
        rewards: [CombatReward.money(10), CombatReward.relic(null, 0.3, "common")],
        sprite : "./sprites/enemies/Mimic.png",
        tooltip : "Veeeeeery hungry"
    },
    [ENEMY_ID.DICE] : {
        name : "Red Eyed Dice",
        baseMaxHP : 50,
        attacks : [
            {
                name : "Roll!",
                effects : [
                    AttackEffect.damageEffect(() => {
                        let rollOne = Math.floor(Math.random() * 7);
                        let rollTwo = Math.floor(Math.random() * 7);
                        return rollOne + rollTwo;
                    })
                ]
            }
        ],
        initialState : 0,
        stateTransition : (ref) => {return ref.state = 0},
        rewards : [CombatReward.money(10), CombatReward.relic(null, 0.1, "common")],
        sprite : "./sprites/enemies/Dice.png",
        tooltip : "Your fate left in the hands of shifty looking dice."
    }
}

class PigBossEnemy extends Enemy {
    constructor() {
        super(ENEMIES[ENEMY_ID.PIG_BOSS]);
    }

    _performAttack(attack) { 
        // add in greed damage buffs
        for (const e of attack.effects) {
            if (e.type == AttackEffect.TYPES.DAMAGE) {
                let greedStacks = this.getStatus(Effect.EFFECT_TYPES.GREED);
                if (greedStacks) {
                    e.value *= 1 + (greedStacks.value/12.5);
                }
            }
        }
        return super._performAttack(attack);
    }
    
    calculateAttackBonus(data) {
        let letters = data.letters;
        let bonusDamage = [];
        for (const l of letters) {
            let bonus = 0;
            if (l.specialTileType) {
                bonus += 3;
            }
            bonusDamage.push(bonus);
        }
        return {
            bonusDamage
        }
    }

    onMoneySpent(money) {
        // add greed stacks
        this.applyEffect(Effect.EFFECT_TYPES.GREED, money);
    }

    defeatAndGiveRewards() {
        log(`Boss defeated!`);

        ui.setupDynamicEvent({
            prompt : "Congratulations on defeating the boss! This is it for the prototype content, but there's one more unwinnable encounter. Try to get as far as you can!",
            options : [
                {
                    text : "Benchmark fight",
                    onSelect : "prototype-boss"
                }
            ]
        })
    }
}

class EnemyFactory {
    static NORMAL_ENEMIES = [
        //ENEMY_ID.GOBBO,
        //ENEMY_ID.GHOST,
        //ENEMY_ID.SLIME,
        ENEMY_ID.DICE,
        ENEMY_ID.MIMIC,
        ENEMY_ID.MR_ROACH,
        ENEMY_ID.SPOODER,
        ENEMY_ID.NORMAL_BIRD
    ]
    static ELITE_ENEMIES = [
        //ENEMY_ID.SNEK,
        ENEMY_ID.SUCCUBUS
    ]
    static BOSS_ENEMIES = [
        //ENEMY_ID.PIG_BOSS,
        ENEMY_ID.PROTOTYPE_END_BOSS
    ]
    static generateEnemy(enemyType, level) {
        switch(enemyType) {
            case ENEMY_ID.PIG_BOSS : {
                return new PigBossEnemy();
            }
            default : {
                return new Enemy(ENEMIES[enemyType], level)
            }
        }
    }
    static randomCommonEnemy(level) {
        return EnemyFactory.generateEnemy(_.sample(EnemyFactory.NORMAL_ENEMIES), level)
    }
    static randomEliteEnemy(level) {
        return EnemyFactory.generateEnemy(_.sample(EnemyFactory.ELITE_ENEMIES), level);
    }
    static randomBossEnemy(level) {
        return EnemyFactory.generateEnemy(_.sample(EnemyFactory.BOSS_ENEMIES), level);
    }
}