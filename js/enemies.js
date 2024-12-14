class Enemy extends Character {

    constructor(data, level) {
        super(); 
        this.name = data.name
        let n = data.baseMaxHP * (1.15 ** level);
        this.maxHP = ((n * 10) << 0) * 0.1; //round to 1 decimal
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
            let v = e.value(this.level);
            switch(e.type) {
                case "damage" : {
                    if (this.isSilenced) v = 0;
                    player.dealDamage(v);
                    break;
                }
                case "heal" : {
                    this.healDamage(v);
                    log(`${this.name} healed ${v} health`);
                    break;
                }
                case "letter-replacement" : {
                    let letters = UI.Letter.getLetters().toArray();
                    switch (v.type) {
                        case "random": {
                            let randomLetters = _.sampleSize(letters, v.number);
                            for (const letter of randomLetters) {
                                let t = $(letter);
                                let l = Letter.getLetterObjectFromElement(t);
                                l.replaceLetter(t, v.letter);
                            }
                            log(`${v.number} letters got replaced to ${v.letter}`)
                            break;
                        }
                        case "destroy": {
                            let randomLetters = _.sampleSize(letters, v.number);
                            for (const letter of randomLetters) {
                                let t = $(letter);
                                Letter.removeLetterFromElement(t);
                            }
                            log(`${v.number} letters were destroyed!`);
                            break;
                        }
                    }
                    
                }
            }
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
        baseMaxHP : 20,
        attacks : [
            {
                name : "Gobbo punch",
                effects : [
                    {
                        type : "damage",
                        value : (level) => {
                            return 5 * (1.15 ** level)
                        }
                    }
                ]
            },
            {
                name : "Gobbo Slam",
                effects : [
                    {
                        type : "damage",
                        value : (level) => {
                            return 10 * (1.15 ** level)
                        }
                    }
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
            {
                type : "money",
                value : (level) => {
                    return 10 + Math.floor(Math.random() * 5);
                },
                probability : 1
            },
        ],
        sprite : "/sprites/enemies/Goblin.png",
        tooltip : "Gobbo gobbin Good"
    },
    [ENEMY_ID.GHOST] : {
        name : "ghooost",
        baseMaxHP : 15,
        attacks : [
            {
                name : "boo!",
                effects : [
                    {
                        type : "letter-replacement",
                        value : (level) => {
                            let r = Math.random() < 0.5;
                            return {
                                letter : (r) ? "o" : "u",
                                number : 2,
                                type : "random"
                            }
                        }
                    },
                    {
                        type : "damage",
                        value : (level) => {
                            return 5 * (1.15 ** level);
                        }
                    }
                ]
            }
        ],
        initialState : 0,
        stateTransition : () => {
            return 0;
        },
        rewards : [
            {
                type : "money",
                value : 8,
                probability : 1
            }
        ],
        sprite : "/sprites/enemies/Ghost.png",
        tooltip : "Hobbies include making your pillow slightly too cold when you sleep."
    },
    [ENEMY_ID.SLIME] : {
        name : "Slime",
        baseMaxHP : 10,
        attacks : [
            {
                name : "Consume",
                effects : [
                    {
                        type : "letter-replacement",
                        value : (level) => {
                            return {
                                type : "destroy",
                                number : 1
                            }
                        }
                    },
                    {
                        type : "damage",
                        value : (level) => {
                            return 5 * (1.15 ** level)
                        }
                    },
                    {
                        type : "heal",
                        value : (level) => {
                            return 2 * (1.15 ** level)
                        }
                    }
                ]
            },
        ],
        initialState : 0,
        stateTransition : (ref) => {
            return ref.state;
        },
        sprite : "/sprites/enemies/Slime.png",
        tooltip : "Perpetually hungry"
    }
}

class EnemyFactory {
    static generateEnemy(enemyType, level) {
        return new Enemy(ENEMIES[enemyType], level)
    }
}