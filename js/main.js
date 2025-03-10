let wordlist = {};
let wordwall = {};
let levelsCleared = 0;
let currentEnemy;
let relicHandler;
let player;
let director;
let combatHandler;
let ui;
let letterModifierHandler;

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
    companionHandler = new CompanionHandler();
    director = new Director();
    combatHandler = new CombatHandler();
    letterModifierHandler = new LetterModifierHandler();

    // pre-make the elements
    ui.preloadElements();
    Letter.calculateLetterProbabilityThresholds();

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
            combatHandler.handleTurn();
        }
    });
    // shuffle button
    $('#letter-board').on("click", "#shuffle", UI.Letter.shuffle);
    // refresh but skip turn button
    $('#letter-board').on("click", "#refresh", RefreshButton.refreshButtonOnClick);
    $('#letter-board').on("click", "#reroll", (e) => {
        combatHandler.rerollButtonOnClick(e);
    });
    // charge abilities
    $("#charge-abilities").on("click", ".ability-container", Ability.abilityOnClick);
    // consumable items
    $('#owned-consumables').on("click", ".player-consumable", (e) => {
        let itemContainer = $(e.currentTarget);
        player.useConsumable(itemContainer.attr("data-c-index"));
    })
    // shop upgrades / ability removal
    // somehow declaring these variables here works???
    selectedLetter = null;
    selectedModifier = null;
    selectedAbility = null;
    $('#letter-board').on("click", "#modifier-letter-container .letter", UI.Shop.modifyLetterOnClick);
    $("#event-area").on("click", ".modifier-container", UI.Shop.modifierOnClick);
    $("#letter-board").on("click", "#modifier-submit", Shop.modifySubmitOnClick);
    $("#event-area").on("click", ".ability-overflow-ability-container", UI.Ability.abilityOverflowAbilityOnClick);
    $("#letter-board").on("click", "#ability-overflow-submit", Ability.abilityOverflowSubmitOnClick);
    
    // info screen modal using jquery-modal
    $('a[data-modal]').click((e) => {
        let j = $(e.currentTarget);
        let modalType = j.attr("href");
        if (modalType == "#stat-screen-letter") {
            UI.Stats.loadProbabilityModal();
        }
        j.modal();
        return false;
    })

    ui.enableTooltips();
    $('#game-start').click(() => {director.startGame()});
}

window.onload = () => {preload()};