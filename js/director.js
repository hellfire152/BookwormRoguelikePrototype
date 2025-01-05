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
            itemShop : 10,
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
                this.levelsCleared += 1;
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
        player.newAbility(ABILITY_ID.GIVE_VULNERABILITY);
        player.newAbility(ABILITY_ID.MAKE_TILE_POISONOUS);
        //player.newAbility(ABILITY_ID.REROLL_TILE);
        //player.newAbility(ABILITY_ID.EXTRA_TILE);
        //player.newAbility(ABILITY_ID.DAMAGE_BOOST);
        player.newAbility(ABILITY_ID.NEXT_LETTER);
        player.newAbility(ABILITY_ID.PREVIOUS_LETTER);
        player.newAbility(ABILITY_ID.OMNISCIENCE);
        player.giveConsumable(CONSUMABLE_ID.SCROLL);

        player.gainCharge(225);
        player.dealDamage(50);
        player.giveMoney(2000);

        companionHandler.addCompanion(COMPANION_ID.CAT);
        this.setupEvent("_intro");
        ui.removeStartButton();
    }

    nextEvent() {
        this.previousEventType = this.currentEventType;
        let options = this.getNextNodeOptions();
        ui.decideNextNodeEvent(options);
    }

    setupCombat() {
        // spawn random enemy
        //currentEnemy = EnemyFactory.generateEnemy(_.sample(ENEMY_ID), this.levelsCleared);
        currentEnemy = EnemyFactory.generateEnemy(ENEMY_ID.GOBBO, this.nodeIndex);
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
        if (this.nodeIndex == 0) { // start with combat
            options.push("combat");
            return options;
        }
        if (this.nodeIndex == 14) { // right before boss
            options.push("boss");
            return options;
        }
        if (this.nodeIndex == 4) {// treasure at 5th node
            options.push("treasure");
            return options;
        }
        if (this.forcedNextNode) {
            // add forced node as single option and return
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