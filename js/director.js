const GAME_CONSTANTS = {
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
            case "enemy-defeated" : {
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
        this.setupEvent("_intro");
        UI.removeStartButton();
    }

    nextEvent() {
        switch(this.gameState) {
            case GAME_CONSTANTS.GAME_STATES.COMBAT:
                this.gameState = GAME_CONSTANTS.GAME_STATES.EVENT;
                UI.setupEvent("_decide-event");
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
        currentEnemy = EnemyFactory.generateEnemy(_.sample(ENEMY_ID), this.levelsCleared);
        currentEnemy.initializeDisplay();
         // begin the combat. players start first.
        this.gameState = GAME_CONSTANTS.GAME_STATES.COMBAT;
        UI.switchScene(this.gameState);
        combatHandler.beginCombat();
    }

    // force setup an event. Usually used for subsequent pages in an event
    setupEvent(e) {
        this.gameState = GAME_CONSTANTS.GAME_STATES.EVENT;
        UI.setupEvent(e);
    }
}