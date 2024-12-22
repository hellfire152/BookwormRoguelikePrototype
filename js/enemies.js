class Enemy extends Character {

    constructor(data, level) {
        super(); 
        this.name = data.name
        let n = data.baseMaxHP * (1.15 ** level);
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

    selectAndPerformAttack() { // goes through attacks in order by default
        if(this.attacks.length <= 0) {
            throw new Error("No attacks on this enemy!");
        }

        this._performAttack(this.attacks[this.state]);
        this.stateTransition(this);
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

    dealDamage(damage, isDirect) {
        let result = super.dealDamage(damage);
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
}

const ENEMY_ID = {
    GOBBO : "E_001",
    GHOST : "E_002",
    SLIME : "E_003",
}
const ENEMIES = {
    [ENEMY_ID.GOBBO] : {
        name : "gobbo",
        baseMaxHP : 200,
        attacks : [
            {
                name : "Gobbo punch",
                effects : [
                    AttackEffect.damageEffect("player", (level) => {
                        if (!level) level = 0;
                        return 5 * (1.15 ** level)
                    })
                ]
            },
            {
                name : "Gobbo Slam",
                effects : [
                    AttackEffect.damageEffect("player", (level) => {
                        if (!level) level = 0;
                        return 10 * (1.15 ** level)
                    }),
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
    }
}

class EnemyFactory {
    static generateEnemy(enemyType, level) {
        return new Enemy(ENEMIES[enemyType], level)
    }
}