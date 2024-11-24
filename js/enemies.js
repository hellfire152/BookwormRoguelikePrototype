class Enemy {
    constructor(level) {
        this.name = "Test enemy";
        let n = 10 * (1.15 ** level);
        this.maxHP = ((n * 10) << 0) * 0.1; //round to 1 decimal
        this.currentHP = this.maxHP;
        this.attacks = [{
            "name" : "Slash",
            "effects" : [
                {
                    "type" : "damage",
                    "value" : 10 * (1.15 ** level)
                }
            ]
        }, {
            "name" : "Heavy Slash",
            "effects" : [
                {
                    "type" : "damage",
                    "value" : 20 * (1.15 ** level)
                }
            ]
        }];
        this.state = 0; // a tracking number for any purpose
        this.rewards = [
            {
                "type" : "money",
                "value" : "10"
            }
        ]
    }

    selectAndPerformAttack() { // goes through attacks in order by default
        if(this.attacks.length <= 0) {
            throw new Error("No attacks on this enemy!");
        }

        this._performAttack(this.attacks[this.state]);

        if (++this.state >= this.attacks.length) {
            this.state = 0;
        }
    }

    _performAttack(attack) {
        // TODO: Say the action in the UI

        for (const e of attack.effects) {
            switch(e.type) {
                case "damage" : {
                    player.dealDamage(e.value);
                    log(`${this.name} dealt ${e.value} damage.`);
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
        enemyContainer.find("#enemy-display").text(this.name);
        enemyContainer.find("#enemy-hp").text(`${this.currentHP}/${this.maxHP} HP`)
    }
}

class EnemyFactory {
    static generateEnemy(enemyType, level) {
        
    }
}