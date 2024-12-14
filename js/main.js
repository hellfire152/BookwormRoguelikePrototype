let wordlist = {};
let wordwall = {};
let levelsCleared = 0;
let currentEnemy;
let relicHandler;
let player;
let director;
let combatHandler;
let ui;

function submitInput() {
    combatHandler.handleTurn();
}

function log(text) {
    let logItem = $("<p></p>");
    logItem.text(text);
    logItem.addClass("game-log-item");

    $("#game-log").prepend(logItem);
}

function preload() {
    Utils.loadWordlist();

    // initialize global singletons
    ui = new UI();
    player = new Player();
    relicHandler = new RelicHandler();
    director = new Director();
    combatHandler = new CombatHandler();

    // pre-make the elements
    ui.preloadElements();
    Letter.calculateLetterProbabilityThresholds();
    Letter.generateLetters();

    // DELEGATED HANDLERS FOR THINGS TO WORK
    // for the event options to work
    $('#letter-board').on('click', '.event-option', (e) => {
        let t = $(e.target);
        let args = t.attr("args")
        EVENT_FUNCTIONS[t.attr("result")](t, args);
    });
    // for the letters to work
    $('#letter-board').on("click", '#letters-available .letter', (e)=>{UI.Letter.letterAvailableOnClick(e)});
    $('#letter-board').on("click", "#letter-input .letter", UI.Letter.letterInInputOnClick);
    $('#letter-board').on("click", "#send-input", (e) => {
        let t = $(e.target);
        if (t.disabled) {
            return;
        } else {
            submitInput();
        }
    });
    // shuffle button
    $('#letter-board').on("click", "#shuffle", UI.Letter.shuffle);
    // refresh but skip turn button
    $('#letter-board').on("click", "#refresh", (e) => {
        Letter.refreshAllLetters(true);
        // enemy takes turn
        combatHandler.handleTurn(skipTurn = true);
    });
    // consumable items
    $('#owned-consumables').on("click", ".player-consumable", (e) => {
        let itemContainer = $(e.currentTarget);
        player.useConsumable(itemContainer.attr("_itemid"));
    })
    // letter modifiers
    selectedLetter = null;
    selectedModifier = null;
    $('#letter-board').on("click", "#modifier-letter-container .letter", UI.Shop.modifyLetterOnClick);
    $("#event-area").on("click", ".modifier-container", UI.Shop.modifierOnClick);
    $("#letter-board").on("click", "#modifier-submit", Shop.modifySubmitOnClick);
    
    ui.enableTooltips();
    $('#game-start').click(() => {director.startGame()});
}

window.onload = () => {preload()};