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
            currentEnemy.defeatAndGiveRewards();
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
    SUCCUBUS : "E|SUCCUBUS"
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
                    AttackEffect.damageEffect("player", (level) => {
                        if (!level) level = 0;
                        return 5 * (1.15 ** level)
                    })
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
                    AttackEffect.damageEffect("player", (level) => {
                        if (!level) level = 0;
                        return 5 * (1.15 ** level)
                    }),
                    AttackEffect.healEffect("enemy", (level) => {
                        if (!level) level = 0;
                        return 2 * (1.15 ** level)
                    })
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
}

class EnemyFactory {
    static NORMAL_ENEMIES = [
        ENEMY_ID.GOBBO,
        ENEMY_ID.GHOST,
        ENEMY_ID.SLIME
    ]
    static ELITE_ENEMIES = [
        ENEMY_ID.SNEK,
        //ENEMY_ID.SUCCUBUS
    ]
    static BOSS_ENEMIES = [
        ENEMY_ID.PIG_BOSS
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