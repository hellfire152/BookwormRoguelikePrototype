let GAME_CONSTANTS = {
    STARTING_LETTER_COUNT : 15,
    GAME_STATES : {
        "COMBAT" : 1,
        "EVENT" : 2,
        "DECIDING-EVENT" : 3
    },
}

// this guy controls the higher level game flow
// class that interacts with a bunch of other classes to make the game work
class Director {
    constructor(options) {
        this.gameState = null;
        this.levelsCleared = 0;
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
        // so we need to start the game loop somewhere
        // let's start with intro (event) -> combat -> event -> combat and so on for now
        //relicHandler.addRelic(RELIC_ID.LIVED_IN_THE_PAST);
        //relicHandler.addRelic(RELIC_ID.ADVERBLY);
        //relicHandler.addRelic(RELIC_ID.PERPETUAL_MOTION_MACHINE);
        //relicHandler.addRelic(RELIC_ID.QUILL);
        relicHandler.addRelic(RELIC_ID.EMPTY_HEADED);
        //relicHandler.addRelic(RELIC_ID.EXTRA_TILE);
        player.newAbility(ABILITY_ID.GIVE_VULNERABILITY);
        player.newAbility(ABILITY_ID.MAKE_TILE_POISONOUS);
        //player.newAbility(ABILITY_ID.REROLL_TILE);
        //player.newAbility(ABILITY_ID.EXTRA_TILE);
        //player.newAbility(ABILITY_ID.DAMAGE_BOOST);
        player.newAbility(ABILITY_ID.NEXT_LETTER);
        player.newAbility(ABILITY_ID.PREVIOUS_LETTER);
        player.gainCharge(200);
        this.setupEvent("_intro");
        ui.removeStartButton();
    }

    nextEvent() {
        switch(this.gameState) {
            case GAME_CONSTANTS.GAME_STATES.COMBAT:
                this.gameState = GAME_CONSTANTS.GAME_STATES.EVENT;
                ui.setupEvent("_decide-event");
                break;
            case GAME_CONSTANTS.GAME_STATES["DECIDING-EVENT"]:
                
                break;
            case GAME_CONSTANTS.GAME_STATES.EVENT:
                //switch to combat
                this.setupCombat();
                break;
            default : {
                console.log("Invalid game state!");
                break;
            }
        }
    }

    setupCombat() {
        // spawn random enemy
        //currentEnemy = EnemyFactory.generateEnemy(_.sample(ENEMY_ID), this.levelsCleared);
        currentEnemy = EnemyFactory.generateEnemy(ENEMY_ID.GOBBO, this.levelsCleared);
        currentEnemy.initializeDisplay();
         // begin the combat. players start first.
        this.gameState = GAME_CONSTANTS.GAME_STATES.COMBAT;
        ui.switchScene(this.gameState);
        combatHandler.beginCombat();
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
}