class Enemy {
    constructor(data, level) {
        this.name = data.name
        let n = data.baseMaxHP * (1.15 ** level);
        this.maxHP = ((n * 10) << 0) * 0.1; //round to 1 decimal
        this.currentHP = this.maxHP;
        this.attacks = data.attacks;
        this.state = data.initialState; // a tracking number for any purpose
        this.stateTransition = data.stateTransition;
        this.rewards = data.rewards;
        this.sprite = data.sprite;
        this.level = level;
    }

    selectAndPerformAttack() { // goes through attacks in order by default
        if(this.attacks.length <= 0) {
            throw new Error("No attacks on this enemy!");
        }

        this._performAttack(this.attacks[this.state]);
        this.stateTransition();
    }

    _performAttack(attack) {
        // TODO: Say the action in the UI

        for (const e of attack.effects) {
            switch(e.type) {
                case "damage" : {
                    let damage = e.value(this.level);
                    player.dealDamage(damage);
                    log(`${this.name} dealt ${damage} damage.`);
                    break;
                }
            }
        }
    }

    defeatAndGiveRewards() {
        for (const r of this.rewards) {
            switch(r.type) {
                case "money": {
                    player.giveMoney(r.value);
                    log(`${this.name} has been defeated! Gained ${r.value} Money`)
                    break;
                }
                case "heal" : {
                    player.healDamage(r.value);
                    log(`${this.name} has been defeated! Healed for ${r.value} HP`)
                }
            }
        }

    }

    dealDamage(damage) {
        this.currentHP -= damage;
        if (this.currentHP <= 0) {
            this.defeatAndGiveRewards();
            levelsCleared += 1;
            nextEvent();
        } else {
            this.currentHP = ((this.currentHP * 10) << 0) * 0.1; // round to 1 decimal place
            this._setHPDisplay();
            this.selectAndPerformAttack();
        }
    }


    healDamage(healAmount) {
        this.currentHP += healAmount;
        if (this.currentHP > this.maxHP) {
            this.currentHP = this.maxHP;
        }
        this._setHPDisplay();
    }

    _setHPDisplay() {
        let hp = $(sceneStore.combat.enemy).find("#enemy-hp");
        hp.text(`${this.currentHP}/${this.maxHP} HP`)
    }

    initializeDisplay() {
        let enemyContainer = $(sceneStore.combat.enemy);
        enemyContainer.find("#enemy-name").text(this.name);
        enemyContainer.find("#enemy-display").attr("src", this.sprite);
        enemyContainer.find("#enemy-hp").text(`${this.currentHP}/${this.maxHP} HP`)
    }
}

const ENEMIES = {
    E_001 : {
        name : "gobbo",
        baseMaxHP : 10,
        attacks : [
            {
                name : "Gobbo punch",
                effects : [
                    {
                        type : "damage",
                        value : (level) => {
                            return 10 * (1.15 ** level)
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
                            20 * (1.15 ** level)
                        }
                    }
                ]
            }
        ],
        initialState : 0,
        stateTransition : (prevState) => {
            let s = prevState + 1;
            if (s >= 2) {
                s = 0
            }
            return s;
        },
        rewards : [
            {
                type : "money",
                value : 10,
                probability : 1
            }
        ],
        sprite : "/sprites/enemies/Goblin.png"
    }
}

class EnemyFactory {
    static generateEnemy(enemyType, level) {
        return new Enemy(ENEMIES[enemyType], level)
    }
}