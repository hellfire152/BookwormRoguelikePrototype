const GAME_CONSTANTS = {
    STARTING_LETTER_COUNT : 15,
    GAME_STATES : {
        "COMBAT" : 1,
        "EVENT" : 2,
        "DECIDING-EVENT" : 3
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
    "item-shop" : {
        "text" : null,
        "options" : null,
    },
    "upgrade-shop" : {
        "text" : null,
        "options" : null
    }
}


let wordlist = {}
let player;
let gameState = null;
let levelsCleared = 0;
let currentEnemy;

function startGame() {
    // so we need to start the game loop somewhere
    // let's start with intro (event) -> combat -> event -> combat and so on for now
    setupEvent("_intro");
    $("#game-start").remove();
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
        optionChoice.attr("args", o.args);
        eventOptionsContainer.append(optionChoice);
    }
}

function nextEvent() {
    switch(gameState) {
        case GAME_CONSTANTS.GAME_STATES.COMBAT:
            setupEvent("_decide-event");
            break;
        case GAME_CONSTANTS.GAME_STATES["DECIDING-EVENT"]:
            
            break;
        case GAME_CONSTANTS.GAME_STATES.EVENT:
            //switch to combat
            setupCombat();
            break;
    }
}

function randomFromArray(arr) {
    return arr[Math.floor(Math.random()*arr.length)];
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
    currentEnemy = EnemyFactory.generateEnemy("E_001", levelsCleared);
    currentEnemy.initializeDisplay();
     // this beings the combat. players start first.
    switchScene(GAME_CONSTANTS.GAME_STATES.COMBAT);
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

    let enemyDisplay = $("<img>");
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

    let bottomButtonsContainer = $("<div>");
    bottomButtonsContainer.attr("id", "bottom-row-buttons-container");

    let shuffleButton = $("<button>");
    shuffleButton.attr("id", "shuffle");
    shuffleButton.text("Shuffle");

    let refreshButton = $("<button>");
    refreshButton.attr("id", "refresh");
    refreshButton.text("Refresh (skips turn!)");

    bottomButtonsContainer.append(refreshButton, shuffleButton);
    combatInputContainer.append(inputSpace, sendInput, letterboard, bottomButtonsContainer);
    sceneStore.combat["player-input"] = combatInputContainer;
}

function generateLetters(noLettersToGenerate, generateSpecial){
    if (typeof noLettersToGenerate == 'undefined') {
        noLettersToGenerate = GAME_CONSTANTS.STARTING_LETTER_COUNT;
    }

    // see if a special tile should be generated
    let specialTile = Letter.specialTileTypeFromLength(noLettersToGenerate);

    let specialGenerated = !generateSpecial;
    for(let i = 0; i < noLettersToGenerate; i++) {
        let letter;
        if(!specialGenerated && specialTile) {
            letter = new Letter(randomLetterMatchingProbabilities(), specialTile);
            specialGenerated = !specialGenerated;
        }
        else {
            letter = new Letter(randomLetterMatchingProbabilities());
        }
        let element = letter.generateElement();

        $(sceneStore.combat["player-input"])
        .find("#letters-available")
        .append(element);
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
    let letters = getLettersInInput();
    let damage = calculateDamage(letters);

    log(`Player dealt ${damage} damage!`);

    // clear input and replace letters
    let letterElements = $('#letter-input').children();
    letterElements.each((index, element) => {
        Letter.removeLetterFromElement(element);
    });
    $("#send-input").prop("disabled", true);
    // remove placeholder letters
    $(".placeholder-letter").remove();
    // replace letters lost
    generateLetters(letters.length, true);

    //handle damage to enemies
    currentEnemy.dealDamage(damage);
}

function getWordInInput() {
    let word = '';
    $('#letter-input').children().each((index, element) => {
        word += $(element).text();
    });
    return word;
}

function getLettersInInput() {
    let letters = [];
    $('#letter-input').children().each((index, element) => {
        let l = Letter.getLetterObjectFromElement(element);
        letters.push(l);
    });
    console.log(letters)
    return letters;
}

function generatePlayerStatBoard() {
    let hpDisplay = $("<div></div>");
    hpDisplay.attr("id", "player-hp");
    hpDisplay.text(`${player.currentHP}/${player.maxHP} HP`);
    hpDisplay.addClass("player-stat");

    let moneyDisplay = $("<div></div>");
    moneyDisplay.attr("id", "player-money");
    moneyDisplay.text(`${player.money} Money`);
    moneyDisplay.addClass("player-stat");

    $("#log").append(hpDisplay, moneyDisplay);
}

function generateLog() {
    let logDisplay = $("<div></div>");
    logDisplay.attr("id", "game-log");

    $("#log").append(logDisplay);
}

function log(text) {
    let logItem = $("<p></p>");
    logItem.text(text);
    logItem.addClass("game-log-item");

    $("#game-log").prepend(logItem);
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

    player = new Player();

    // pre-make the elements
    generateInputSpace();
    generateLetters();
    generatePlayerStatBoard();
    generateEventDetail();
    generateEnemyContainer();
    generateLog();

    // DELEGATED HANDLERS FOR THINGS TO WORK
    // for the event options to work
    $('#letter-board').on('click', '.event-option', (e) => {
        let t = $(e.target);
        let args = t.attr("args")
        EVENT_FUNCTIONS[t.attr("result")](t, args);
    });
    // for the letters to work
    $('#letter-board').on("click", '#letters-available .letter', Letter.letterAvailableOnClick);
    $('#letter-board').on("click", "#letter-input .letter", Letter.letterInInputOnClick);
    $('#letter-board').on("click", "#send-input", (e) => {
        let t = $(e.target);
        if (t.disabled) {
            return;
        } else {
            submitInput();
        }
    });
    // shuffle button
    $('#letter-board').on("click", "#shuffle", (e) => {
        let lettersAvil = $("#letters-available");
        let shuffled = _.shuffle(lettersAvil.children().toArray());
        lettersAvil.empty();
        lettersAvil.append(shuffled);        
    });
    // refresh but skip turn button
    $('#letter-board').on("click", "#refresh", (e) => {
        Letter.refreshAllLetters(true);
        // enemy takes turn
        currentEnemy.selectAndPerformAttack();
    });
    // consumable items
    $('#owned-consumables').on("click", ".player-consumable", (e) => {
        let itemContainer = $(e.currentTarget);
        player.useConsumable(itemContainer.attr("_itemid"));
    })
    // letter modifiers
    selectedLetter = null;
    selectedModifier = null;
    $('#letter-board').on("click", "#modifier-letter-container .letter", Shop.modifyLetterOnClick);
    $("#event-area").on("click", ".modifier-container", Shop.modifierOnClick);
    $("#letter-board").on("click", "#modifier-submit", Shop.modifySubmitOnClick);

    $('#game-start').click(startGame);
}



window.onload = () => {preload()};