const GAME_CONSTANTS = {
    STARTING_LETTER_COUNT : 15,
    GAME_STATES : {
        "COMBAT" : 1,
        "EVENT" : 2,
    },
}

var sceneStore = {
    "combat" : {
        "enemy" : null,
        "player-input" : null,
    },
    "event" : {
        "text" : null,
        "options" : null,
    },
}

var LETTER_PROBABILITY_POINTS = {
    "a" : 80,
    "b" : 20,
    "c" : 20,
    "d" : 40,
    "e" : 80,
    "f" : 20,
    "g" : 20,
    "h" : 40,
    "i" : 80,
    "j" : 10,
    "k" : 10,
    "l" : 40,
    "m" : 20,
    "n" : 40,
    "o" : 70,
    "p" : 20,
    "q" : 5,
    "r" : 40,
    "s" : 40,
    "t" : 50,
    "u" : 60,
    "v" : 10,
    "w" : 20,
    "x" : 10,
    "y" : 20,
    "z" : 10
}
var LETTER_PROBABILTY_THRESHOLDS = {
    "a" : 0,
    "b" : 0,
    "c" : 0,
    "d" : 0,
    "e" : 0,
    "f" : 0,
    "g" : 0,
    "h" : 0,
    "i" : 0,
    "j" : 0,
    "k" : 0,
    "l" : 0,
    "m" : 0,
    "n" : 0,
    "o" : 0,
    "p" : 0,
    "q" : 0,
    "r" : 0,
    "s" : 0,
    "t" : 0,
    "u" : 0,
    "v" : 0,
    "w" : 0,
    "x" : 0,
    "y" : 0,
    "z" : 0
}
let LETTER_PROBABILITY_POINT_MAX = 0;

let LETTER_DAMAGE_VALUES = {
    "a" : 1,
    "b" : 3,
    "c" : 3,
    "d" : 2,
    "e" : 1,
    "f" : 3,
    "g" : 3,
    "h" : 2,
    "i" : 1,
    "j" : 5,
    "k" : 5,
    "l" : 2,
    "m" : 3,
    "n" : 2,
    "o" : 1,
    "p" : 4,
    "q" : 7,
    "r" : 2,
    "s" : 1,
    "t" : 1,
    "u" : 1,
    "v" : 5,
    "w" : 3,
    "x" : 5,
    "y" : 3,
    "z" : 5
}

let wordlist = {}
let player;
let gameState = null;
let levelsCleared = 0;
let currentEnemy;

function startGame() {
    // so we need to start the game loop somewhere
    // let's start with intro (event) -> combat -> event -> combat and so on for now
    setupEvent("intro");
}

class Player {
    constructor() {
        this.money = 0;
        this.items = [];
        this.flags = {};
        this.maxHP = 100;
        this.currentHP = this.maxHP;
    }

    attemptPurchase(item) {

    }

    giveMoney(amountGiven) {
        this.money += parseInt(amountGiven);

        //set value in UI
        this._updateMoneyDisplay();
    }

    _updateMoneyDisplay() {
        $("#player-money").text(`${this.money} Money`)
    }

    checkFlag(flag) {
        return !!this.flags[flag]
    }

    setFlag(flag) {
        this.flags[flag] = true;
    }

    dealDamage(damage) {
        this.currentHP -= damage;
        this._updateHPDisplay();
        if (this.currentHP <= 0) {
            alert(`Game Over! You lasted ${levelsCleared} rounds.`);
        }
        return true;
    }

    healDamage(healAmount) {
        this.currentHP += healAmount;
        if (this.currentHP > this.maxHP) {
            this.currentHP = this.maxHP;
        }
        this._updateHPDisplay();
    }

    _updateHPDisplay() {
        $("#player-hp").text(`${this.currentHP}/${this.maxHP} HP`)
    }

    setHP(hp) {
    }

    setMaxHP(hp) {

    }
}

class Letter {
    constructor(letter) {
        this.letter = letter;
        this.powerup = null;
        this.locked = null;
    }
}

function setupEvent(eventName) {
    eventDetails = EVENT_DETAILS[eventName];
    setEventPrompt(eventDetails.prompt);
    setEventPlayerOptions(eventDetails.options);

    switchScene(GAME_CONSTANTS.GAME_STATES.EVENT);
}

function setEventPrompt(text) {
    $(sceneStore.event.text).text(text);
}
function setEventPlayerOptions(optionsArr) {
    // clear options
    let eventOptionsContainer = $(sceneStore.event.options);
    eventOptionsContainer.empty();

    // generate new options
    for (const o of optionsArr) {
        let optionChoice = $("<button></button>");
        optionChoice.addClass("event-option");
        optionChoice.text(o.text);
        optionChoice.attr("result", o.onSelect);
        eventOptionsContainer.append(optionChoice);
    }
}

function nextEvent() {
    switch(gameState) {
        case GAME_CONSTANTS.GAME_STATES.COMBAT:
            //switch to random event
            let allEvents = Object.keys(EVENT_DETAILS);
            for (const e of allEvents) {
                if (e.startsWith("_"))  { // don't include event continuations
                    let i = allEvents.indexOf(e);
                    allEvents.splice(i, 1);
                }
            }

            //get a random event from remaining events
            let randomEvent = allEvents[Math.floor(Math.random()*allEvents.length)];
            setupEvent(randomEvent);
            break;
        case GAME_CONSTANTS.GAME_STATES.EVENT:
            //switch to combat
            setupCombat();
            break;
    }
}

function generateEventDetail() {
    //top half display
    let eventContainer = $("<div></div>");
    eventContainer.attr("id", "event-detail-container");

    let eventDetail = $("<div></div>");
    eventDetail.attr("id", "event-detail-text");

    eventContainer.append(eventDetail);
    sceneStore.event.text = eventContainer;

    let eventOptionsContainer = $("<div></div>");
    eventOptionsContainer.attr("id", "event-options-container");
    sceneStore.event.options = eventOptionsContainer;
}

function setupCombat() {
    currentEnemy = generateEnemy(levelsCleared);
    currentEnemy.initializeDisplay();
    switchScene(GAME_CONSTANTS.GAME_STATES.COMBAT);
    // this beings the combat. players start first.
}

function generateEnemy(level) {
    return new Enemy(level);
}

function switchScene(sceneType) {
    // clear what's previously there
    $('#event-area').empty();
    $('#letter-board').empty();

    switch(sceneType) {
        case GAME_CONSTANTS.GAME_STATES.COMBAT:
            $("#event-area").append(sceneStore.combat.enemy);
            $("#letter-board").append(sceneStore.combat["player-input"])
            gameState = GAME_CONSTANTS.GAME_STATES.COMBAT;
            break;
        case GAME_CONSTANTS.GAME_STATES.EVENT:
            $("#event-area").append(sceneStore.event.text);
            $("#letter-board").append(sceneStore.event.options);
            gameState = GAME_CONSTANTS.GAME_STATES.EVENT;
            break;
    }

}

function generateEnemyContainer() {
    let enemyContainer = $("<div></div>");
    enemyContainer.attr("id", "enemy-container");

    let enemyName = $("<div></div>");
    enemyName.attr("id", "enemy-name");

    let enemyDisplay = $("<div></div>");
    enemyDisplay.attr("id", "enemy-display");

    let enemyHP = $("<div></div>");
    enemyHP.attr("id", "enemy-hp");

    enemyContainer.append(enemyName, enemyHP, enemyDisplay);
    sceneStore.combat.enemy = enemyContainer;
}

function generateInputSpace() {
    let combatInputContainer = $("<div></div>");
    combatInputContainer.attr('id', 'combat-input-container');

    let inputSpace = $("<div></div");
    inputSpace.attr('id','letter-input');
    
    let sendInput = $("<button></button>");
    sendInput.attr('id', 'send-input');
    sendInput.prop("disabled", true)

    let letterboard = $("<div></div>");
    letterboard.attr('id', 'letters-available');

    combatInputContainer.append(inputSpace, sendInput, letterboard);
    sceneStore.combat["player-input"] = combatInputContainer;
}

function generateLetters(noLettersToGenerate){
    if (typeof noLettersToGenerate == 'undefined') {
        noLettersToGenerate = GAME_CONSTANTS.STARTING_LETTER_COUNT;
    }

    for(let i = 0; i < noLettersToGenerate; i++) {
        let letter = $("<div></div>");
        letter.addClass('letter');
        letter.text(randomLetterMatchingProbabilities());
        $(sceneStore.combat["player-input"])
        .find("#letters-available")
        .append(letter);
    }
}

function randomLetterMatchingProbabilities() {
    let max = LETTER_PROBABILITY_POINT_MAX;
    let randomInt = Math.floor(Math.random() * max + 1);

    let result = "a";
    for (l in LETTER_PROBABILTY_THRESHOLDS) {
        if (randomInt <= LETTER_PROBABILTY_THRESHOLDS[l]) {
            return l;
        }
    }
}

function checkWordExists(word) {
    return !!wordlist[word]
}

function evaluateInput() {
    let word = getWordInInput();

    if (checkWordExists(word) && word.length >= 3) {
        $("#send-input").prop("disabled", false);
    } else {
        $("#send-input").prop("disabled", true);
    }
}

function submitInput() {
    // submit button shouldn't even work if the word is invalid
    // so we ain't validating it again kekw
    let word = getWordInInput();

    let damage = 0;
    [...word].forEach((c) => { //calculate total damage
        damage += LETTER_DAMAGE_VALUES[c];
    });
    
    // clear input and replace letters
    let letterElements = $('#letter-input').children();
    letterElements.each((index, element) => {
        element.remove()
    });
    generateLetters(word.length);

    //handle damage to enemies
    let isDead = currentEnemy.dealDamage(damage);
    if (isDead) {
        currentEnemy.defeatAndGiveRewards();
        levelsCleared += 1;
        nextEvent();
    } else {
        //enemy attacks back
        currentEnemy.selectAndPerformAttack();
    }
}

function getWordInInput() {
    let word = '';
    $('#letter-input').children().each((index, element) => {
        word += $(element).text();
    });
    return word;
}

function generatePlayerStatBoard() {
    let hpDisplay = $("<div></div>");
    hpDisplay.attr("id", "player-hp");
    hpDisplay.text("100/100 HP");
    hpDisplay.addClass("player-stat");

    let moneyDisplay = $("<div></div>");
    moneyDisplay.attr("id", "player-money");
    moneyDisplay.text("0 Money");
    moneyDisplay.addClass("player-stat");

    $("#log").append(hpDisplay, moneyDisplay);
}

function preload() {
    // loads all words into a dictionary
    fetch("words_alpha.txt")
      .then(response => response.text())
      .then((data) => {
        let lines = data.split('\n');
        for (let l = 0; l < lines.length; l++) {
            wordlist[lines[l].trim()] = 1
        }
      });

    // pre-calculate letter probability thresholds
    calculateLetterProbabilityThresholds();
    
    // pre-make the elements
    generateInputSpace();
    generateLetters();
    generatePlayerStatBoard();
    generateEventDetail();
    generateEnemyContainer();

    player = new Player();

    // DELEGATED HANDLERS FOR THINGS TO WORK
    // for the event options to work
    $('#letter-board').on('click', '.event-option', (e) => {
        let t = $(e.target);
        EVENT_FUNCTIONS[t.attr("result")]();
    });
    // for the letters to work
    $('#letter-board').on("click", '#letters-available .letter', (e) => {
        let t = $(e.target);
        t.detach();
        $('#letter-input').append(t);
        evaluateInput();
    })
    $('#letter-board').on("click", "#letter-input .letter", (e) => {
        let t = $(e.target);
        t.detach();
        $('#letters-available').append(t);
        evaluateInput();
    })
    $('#letter-board').on("click", "#send-input", (e) => {
        let t = $(e.target);
        if (t.disabled) {
            return;
        } else {
            submitInput();
        }
    })

    $('#game-start').click(startGame);
}

function calculateLetterProbabilityThresholds() {
    let threshold = 0;
    LETTER_PROBABILITY_POINT_MAX = 0; // reset max
    for (l in LETTER_PROBABILITY_POINTS) {
        LETTER_PROBABILITY_POINT_MAX += LETTER_PROBABILITY_POINTS[l];
        threshold += LETTER_PROBABILITY_POINTS[l];
        LETTER_PROBABILTY_THRESHOLDS[l] = threshold;
    }
}

window.onload = () => {preload()};