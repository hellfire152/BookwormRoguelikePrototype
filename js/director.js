let GAME_CONSTANTS = {
    STARTING_LETTER_COUNT : 15,
    GAME_STATES : {
        "COMBAT" : 1,
        "EVENT" : 2,
        "DECIDING-EVENT" : 3
    },
    UPGRADE_LETTERS_OFFERRED_COUNT : 5,
    NEXT_NODE_OPTIONS_COUNT : 2
}




// this guy controls the higher level game flow
// class that interacts with a bunch of other classes to make the game work
class Director {
    constructor(options) {
        this.gameState = null;
        this._nodeIndex = 0;
        this.chapter = 1;
        this.maxNodes = 15;
        this.forcedNextNode = null;
        this.previousEventType = null;
        this.currentEventType = null;
        this.nodeTypeProbabilties = {
            combat : 42,
            elite : 7,
            event : 41,
            itemShop : 5,
            abilityShop : 5,
            upgradeShop : 10,
            treasure : 0,
            boss : 0
        }
        this.nodeTypeProbabilitiesThreshold = {}
        this.nodeTypeProbabilitiyPointMax = 0;
    }

    // signals are used when something needs to happen, but the component that
    // sends the signal doesn't know what exactly will happen
    // e.g. story flags need to be checked, custom event flag from earlier forced to happen, etc.
    // Seems pointless now but I'm hoping putting all that logic here 
    // makes things neater and easier to understand
    // when we start adding a lot more features in the long run
    signal(signalType, data) {
        switch(signalType) {
            case "combat-complete" : {
                this.nextEvent();
                break;
            }
            case "boss-defeated" : {

            }
            case "event-complete" : {
                this.nextEvent();
                break;
            }
            case "exit-shop" : {
                this.nextEvent();
                break;
            }
        }

    }

    
    // should only be called once
    startGame() {
        // calculate node type probablities
        this.calculateNodeTypeProbabilitiesThresholds();

        // so we need to start the game loop somewhere
        // let's start with intro (event) -> combat -> event -> combat and so on for now
        player.newAbility(ABILITY_ID.NEXT_LETTER);
        player.newAbility(ABILITY_ID.GENERATE_GEM);
        player.newAbility(ABILITY_ID.OMNISCIENCE);
        player.giveConsumable(CONSUMABLE_ID.CLEANSING_POTION);

        player.gainCharge(225);
        player.giveMoney(2000);

        relicHandler.addRelic(RELIC_ID.T_ADDITIONAL_GEM_TILE);
        companionHandler.addCompanion(COMPANION_ID.CAT);
        this.setupEvent("_intro");
        ui.removeStartButton();
    }

    nextEvent() {
        if (this.skipNodeCounterAdvance) {
            this.skipNodeCounterAdvance = false;
        } else {
            this.nodeIndex++;
        }
        this.previousEventType = this.currentEventType;
        let options = this.getNextNodeOptions();
        ui.decideNextNodeEvent(options);
    }

    setupCombat(enemyType = "normal", enemyId, advanceNodeCounter = true) {
        if (enemyId) {
            currentEnemy = enemyId; //fixed enemy
        } else {
            switch (enemyType) {
                case "normal" : {
                    currentEnemy = EnemyFactory.randomCommonEnemy(this.chapter);
                    break;
                }
                case "elite" : {
                    currentEnemy = EnemyFactory.randomEliteEnemy(this.chapter);
                    break;
                }
                case "boss" : {
                    currentEnemy = EnemyFactory.randomBossEnemy(this.chapter);
                    break;
                }
            }
        }
        if (!advanceNodeCounter) this.skipNodeCounterAdvance = true;
        currentEnemy.initializeDisplay();
         // begin the combat. players start first.
        this.gameState = GAME_CONSTANTS.GAME_STATES.COMBAT;
        ui.switchScene(this.gameState);
        combatHandler.beginCombat();
    }

    getSingleNodeOption() {
        let randomInt = Math.floor(Math.random() * this.nodeTypeProbabilitiyPointMax + 1);
        for (const t in this.nodeTypeProbabilitiesThreshold) {
            if (randomInt <= this.nodeTypeProbabilitiesThreshold[t]) {
                return t;
            }
        }
    }

    getNextNodeOptions() {
        let options = [];
        options.push("abilityShop");
        if (this.nodeIndex == 1) { // start with combat
            options.push("combat");
            return options;
        }
        if (this.nodeIndex == 15) { // boss
            options.push("boss");
            return options;
        }
        if (this.nodeIndex == 5) {// treasure at 5th node
            options.push("treasure");
            return options;
        }
        if (this.forcedNextNode) {
            // add forced node as single option and return
            options.push(this.forcedNextNode);
            // make sure the event is the forced one. Probably need to add some args
            return options;
        }
        while (options.length < GAME_CONSTANTS.NEXT_NODE_OPTIONS_COUNT) { // random options otherwise
            let option = this.getSingleNodeOption();
            if (options.includes(option)) continue;
            options.push(option);
        }

        return options;
    }

    // force setup an event. Usually used for subsequent pages in an event
    setupEvent(e) {
        this.gameState = GAME_CONSTANTS.GAME_STATES.EVENT;
        ui.setupEvent(e);
    }

    get isInCombat() {
        return (this.gameState == GAME_CONSTANTS.GAME_STATES.COMBAT
            && currentEnemy.isAlive
        );
    }

    calculateNodeTypeProbabilitiesThresholds() {
        let threshold = 0;
        for (const t in this.nodeTypeProbabilties) {
            threshold += this.nodeTypeProbabilties[t];
            this.nodeTypeProbabilitiesThreshold[t] = threshold;
        }
        this.nodeTypeProbabilitiyPointMax = threshold;
    }

    playerDefeated() {
        let message = "Game Over!"
        if (currentEnemy.name == "Prototype Boss") {
            message += `Final score: ${currentEnemy.maxHP - currentEnemy.currentHP}`
        }
        alert(message);
    }

    nextWorld() {
    }

    get nodeIndex() {
        return this._nodeIndex;
    }

    set nodeIndex(value) {
        this._nodeIndex = value;
        if (this._nodeIndex > 15) this.nextWorld();
        ui.setProgressDisplay(this.chapter, this._nodeIndex);
    }
}