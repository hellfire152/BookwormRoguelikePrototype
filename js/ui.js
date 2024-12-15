class UI {
    sceneStore;
    _tempSceneStore;
    
    constructor(){
        this.sceneStore = {
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
            },
        }
    }

    preloadElements() {
        this._generateInputSpace();
        this._generatePlayerStatBoard();
        this._generateEventDetail();
        this._generateEnemyContainer();
        this._generateLog();
    }

    // for events with static prompt and option text
    setupEvent(eventName) {
        let eventDetails = EVENT_DETAILS[eventName];
        this.setupDynamicEvent(eventDetails);
    }
    // use this if the event description and option text have to be
    // dynamically generated i.e. battle rewards
    setupDynamicEvent(eventDetail) { 
        this.setEventPrompt(eventDetail.prompt);
        this.setEventPlayerOptions(eventDetail.options);
        this.switchScene(GAME_CONSTANTS.GAME_STATES.EVENT);
    }
    setEventPrompt(text) {
        $(this.sceneStore.event.text).text(text);
    }
    setCustomEventPrompt(e) { // for more than just text
        this.sceneStore.event.text = $(e);
    }
    setEventPlayerOptions(optionsArr) {
        // clear options
        let eventOptionsContainer = $(this.sceneStore.event.options);
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

    _generateEventDetail() {
        //top half display
        let eventContainer = $("<div></div>");
        eventContainer.attr("id", "event-detail-container");
    
        let eventDetail = $("<div></div>");
        eventDetail.attr("id", "event-detail-text");
    
        eventContainer.append(eventDetail);
        this.sceneStore.event.text = eventContainer;
    
        let eventOptionsContainer = $("<div></div>");
        eventOptionsContainer.attr("id", "event-options-container");
        this.sceneStore.event.options = eventOptionsContainer;
    }

    switchScene(sceneType) {
        // clear what's previously there
        $('#event-area').empty();
        $('#letter-board').empty();
        switch(sceneType) {
            case GAME_CONSTANTS.GAME_STATES.COMBAT:
                $("#event-area").append(this.sceneStore.combat.enemy);
                $("#letter-board").append(this.sceneStore.combat["player-input"])
                break;
            case GAME_CONSTANTS.GAME_STATES.EVENT:
                $("#event-area").append(this.sceneStore.event.text);
                $("#letter-board").append(this.sceneStore.event.options);
                break;
        }
    
    }

    saveCurrentSceneState() {
        this._tempSceneStore = _.cloneDeep(this.sceneStore);
    }
    loadPreviousSceneState(gameState) {
        this.sceneStore = this._tempSceneStore;
        this._tempSceneStore = null;
        this.switchScene(parseInt(gameState));
    }
   
    _generateEnemyContainer() {
        let enemyContainer = $("<div></div>");
        enemyContainer.attr("id", "enemy-container");
    
        let enemyName = $("<div></div>");
        enemyName.attr("id", "enemy-name");
    
        let enemyDisplay = $("<img>");
        enemyDisplay.attr("id", "enemy-display");
        enemyDisplay.addClass("hover-tooltip")
    
        let statusDisplay = $("<div>");
        statusDisplay.attr("id", "enemy-status-container");
    
        let enemyMaxHP = $("<div></div>");
        enemyMaxHP.addClass("max-hp");
        enemyMaxHP.attr("id", "enemy-max-hp")

        let enemyHPText = $("<div>");
        enemyHPText.attr("id", "enemy-hp-text");
        enemyHPText.addClass("stat-bar-text");
        enemyHPText.text(`0/0 HP`);

        let enemyCurrentHP = $("<div>");
        enemyCurrentHP.attr("id", "enemy-current-hp");
        enemyCurrentHP.addClass("current-hp");
        enemyCurrentHP.css("width", `100%`);
        enemyMaxHP.append(enemyHPText, enemyCurrentHP);

        enemyContainer.append(enemyName, enemyMaxHP, enemyDisplay, statusDisplay);
        this.sceneStore.combat.enemy = enemyContainer;
    }
    
    _generateInputSpace() {
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
        shuffleButton.addClass("bottom-row-button");

        let refreshButton = $("<button>");
        refreshButton.attr("id", "refresh");
        refreshButton.text("Refresh (skips turn!)");
        refreshButton.addClass("bottom-row-button");
    
        bottomButtonsContainer.append(refreshButton, shuffleButton);
        combatInputContainer.append(inputSpace, sendInput, letterboard, bottomButtonsContainer);
        this.sceneStore.combat["player-input"] = combatInputContainer;
    }

    _generatePlayerStatBoard() {
        let statContainer = $("<div>");
        statContainer.attr("id", "player-stat-container");
    
        // HP DISPLAY
        let maxHpDisplay = $("<div></div>");
        maxHpDisplay.attr("id", "player-max-hp");
        maxHpDisplay.addClass("max-hp")

        let hpText = $("<div>");
        hpText.attr("id", "player-hp-text");
        hpText.addClass("stat-bar-text");
        hpText.text(`100 / 100 HP`);

        let currentHpDisplay = $("<div>");
        currentHpDisplay.attr("id", "player-current-hp");
        currentHpDisplay.addClass("current-hp")
        currentHpDisplay.css("width", "100%")
        maxHpDisplay.append(hpText, currentHpDisplay);
        
        // CHARGE DISPLAY
        let maxChargeDisplay = $("<div></div>");
        maxChargeDisplay.attr("id", "player-max-charge");
        maxChargeDisplay.addClass("max-charge")

        let chargeText = $("<div>");
        chargeText.attr("id", "player-charge-text");
        chargeText.addClass("stat-bar-text");
        chargeText.text(`0 / 100 Charge`);

        let currentChargeDisplay = $("<div>");
        currentChargeDisplay.attr("id", "player-current-charge");
        currentChargeDisplay.addClass("current-charge")
        currentChargeDisplay.css("width", "0%")
        maxChargeDisplay.append(chargeText, currentChargeDisplay);

        let moneyDisplay = $("<div></div>");
        moneyDisplay.attr("id", "player-money");
        moneyDisplay.text(`${player.money} Money`);
        moneyDisplay.addClass("player-stat");
    
        let statusContainer = $("<div>");
        statusContainer.attr("id", "player-status-container");
    
        statContainer.append(maxHpDisplay, maxChargeDisplay, moneyDisplay);
        $("#log").append(statContainer, statusContainer);
    }

    _generateLog() {
        let logDisplay = $("<div></div>");
        logDisplay.attr("id", "game-log");
    
        $("#log").append(logDisplay);
    }
    
    getWordInInput() {
        let word = '';
        let letters = UI.Letter.getLettersInInput();
        for (const l of letters) {
            word += l.letter
        }
        return word;
    }

    // handles enemy UI stuff
    static Enemy = class UIEnemy {
        static initializeEnemyDisplay(enemy) {
            let enemyContainer = $(ui.sceneStore.combat.enemy);
            enemyContainer.find("#enemy-name").text(enemy.name);
            let display = enemyContainer.find("#enemy-display");
            display.attr("src", enemy.sprite);
            display.attr("data-tooltip-content", enemy.tooltip);
            UI.Enemy.updateHPDisplay(enemy);
            UI.Enemy.updateStatusDisplay(enemy.getStatuses())
        }

        static updateHPDisplay(enemy) {
            // not searching the id directly as it may not be rendered yet
            let con = $(ui.sceneStore.combat.enemy);
            con.find("#enemy-current-hp").css("width", `${enemy.hpPercent}%`)
            con.find("#enemy-hp-text").text(`${enemy.currentHP}/${enemy.maxHP} HP`);
        }

        static updateStatusDisplay(statuses) {
            let statusContainer = $(`#enemy-status-container`);
            statusContainer.empty();

            for (const e of statuses) {
                statusContainer.append(e.generateElement("enemy"));
            }
        }
    }

    static Player = class UIPlayer {
        static updateStatusDisplay(statuses) {
            let statusContainer = $(`#player-status-container`);
            statusContainer.empty();

            for (const e of statuses) {
                statusContainer.append(e.generateElement("player"));
            }
        }
        static updateConsumableDisplay(player) {
            $("#owned-consumables").empty();
            for (let i = 0; i < player.consumables.length; i++) {
                $("#owned-consumables").append(player.consumables[i].generateElement(false, i));
            }
        }
        static updateHPDisplay(player) {
            $("#player-current-hp").css("width", `${player.hpPercent}%`);
            $("#player-hp-text").text(`${player.currentHP} / ${player.maxHP} HP`);
        }
        static updateChargeDisplay(player) {
            $("#player-current-charge").css("width", `${player.chargePercent}%`);
            $("#player-charge-text").text(`${player.currentCharge} / ${player.maxCharge} Charge`);
        }
        static updateMoneyDisplay(player) {
            $("#player-money").text(`${player.money} Money`)
        }
    
    }

    static Letter = class UILetter {
        static getLetters() {
            return $(".letter:not(.placeholder-letter)");
        }
        static getLettersInInput() {
            let letters = [];
            $('#letter-input').children().each((index, element) => {
                let l = Letter.getLetterObjectFromElement(element);
                letters.push(l);
            });
            return letters;
        }
        static getLetterElementsInInput() {
            return $('#letter-input').children();
        }
        static getAvailableLetterElements() {
            return $('#letters-available').children().toArray();
        }
        static shuffle(e) {
            let lettersAvil = $("#letters-available");
            let shuffled = _.shuffle(lettersAvil.children().toArray());
            lettersAvil.empty();
            lettersAvil.append(shuffled);
        }
        // onclick handlers
        static letterInInputOnClick(e) {
            let t = $(e.target);
            t.detach();
    
            $(`.placeholder-letter[_pfor=${t.attr("_letterref")}]`).replaceWith(t);
            Utils.evaluateInput(ui.getWordInInput());
        }
        static letterAvailableOnClick(e) {
            let t = $(e.target);
            // skip placeholder letters
            if (t.attr("_pfor")) {
                return;
            }
            // generate a new blank letter to replace it with
            let placeholder = new Letter("", SPECIAL_TILE_TYPES.UNSELECTABLE);
            placeholder.placeholder_for = t.attr("_letterref");
    
            t.replaceWith(placeholder.generateElement());
            
            $('#letter-input').append(t);
            Utils.evaluateInput(ui.getWordInInput());
        }

        static appendLetterElement(letterElement) {
            $(ui.sceneStore.combat["player-input"])
              .find("#letters-available")
              .append(letterElement);
        }
        static getLettersInSceneStore() {
            return $(ui.sceneStore.combat["player-input"])
                .find("#letters-available .letter")
                .toArray()
        }
        static temporaryTileHighlightWithCallback(callback, highlightClass = "temporary-highlight") {
            let letters = UI.Letter.getLetters();
            letters.addClass(highlightClass);
            letters.one('click', (e) => {
                let t = $(e.currentTarget);
                let letter = Letter.getLetterObjectFromElement(t);
                callback(t, letter);
                letters.removeClass(highlightClass);
                letters.off("click");
            });
        }
    }
    static Relic = class UIRelic {
        static updateDisplay() {
            // remove currently displayed relics
            $("#owned-relics").empty();
            // re-generate all 
            for(const r of Object.values(relicHandler.getOwnedRelics())) {
                $("#owned-relics").append(r.generateElement());
            }
        }
    }
    static Ability = class UIAbility {
        static updateDisplay(player) {
            $("#charge-abilities").empty();
            for(const c of player.chargeAbilities) {
                $("#charge-abilities").append(c.generateElement());
            }
        }
        static getAbilityIdFromOnclick(e) {
            let j = $(e.currentTarget);
            return j.attr("data-ability-id");
        }
        static loadTooManyAbilitiesScreen() {
            ui.saveCurrentSceneState();

            // load the remove ability scene
            let removeAbilityContainer = $("<div>");
            removeAbilityContainer.attr("id", "remove-ability-container");

            let removeAbilityPrompt = $("<div>");
            removeAbilityPrompt.attr("id", "remove-ability-prompt");
            removeAbilityPrompt.text("Too many abilities! Select one to remove...");

            let abilityContainers = $("<div>");
            abilityContainers.attr("id", "remove-ability-ability-containers");

            // generate an ability for each thing
            for (const a in player.chargeAbilities) {
                let e = a.generateElement();
                e.addClass("remove-ability-ability-container");
                abilityContainers.append(e);
            }

            // submit ability to remove button
            let bottomContainer = $("<div>");
            bottomContainer.attr("id", "remove-ability-confirmation");
            let submitAbilityButton = $("<button>");
            submitAbilityButton.attr("id", "remove-ability-submit")
            submitAbilityButton.attr("data-return-state", GAME_CONSTANTS.GAME_STATES.EVENT);
            let bottomRowContainer = $("<div>");
            bottomRowContainer.attr("id", "bottom-row-buttons-container");
            bottomRowContainer.append(submitAbilityButton);

            bottomContainer.append(bottomRowContainer);
            removeAbilityContainer.append(removeAbilityPrompt, abilityContainers)
            
            ui.sceneStore.event.text = removeAbilityContainer;
            ui.sceneStore.event.options = bottomContainer;
            ui.switchScene(GAME_CONSTANTS.GAME_STATES.EVENT);
        }
        
        // mostly same as upgrade shop code
        static removeAbilityAbilityOnClick(e) {
            let j = $(e.target);
        
            // unselect everything else
            let otherAbilities = j.siblings();
            otherAbilities.attr("data-selected", "false");
            otherAbilities.css("border", "");

            // toggle selected on target
            if (j.attr("data-selected") == "true") {
                j.attr("data-selected", "false")
                j.css("border", "");
                selectedAbilityToRemove = null;
            } else {
                j.attr("data-selected", "true");
                j.css("border", "3px solid cyan");
                selectedAbilityToRemove = j.attr("data-ability-id");
            }
        }
    }
    static Shop = class thisShop {
        static loadItemShop() {
            let shopContainer = $("<div></div>");
            shopContainer.attr("id", "shop-container");
        
            let shopPrompt = $("<div>");
            shopPrompt.attr("id", "shop-text");
            shopPrompt.text("SHOP");
        
            let shopItems = $("<div></div>");
            shopItems.attr("id", "shop-items-container");
         
            //generate 3 random relics and 3 random consumables
            let options = [];
            let consumables = _.sampleSize(CONSUMABLE_ID, 3).sort();
        
            console.log(consumables);
            for (const cid of consumables) {
                let consumable = ConsumableFactory.generateConsumable(cid);
                shopItems.append(consumable.generateElement(true));
        
                options.push({
                    "text" : consumable.name,
                    "onSelect" : "purchase-item",
                    "args" : `${cid}@consumable`
                });
            }
        
            shopContainer.append(shopPrompt, shopItems);
            ui.sceneStore.event.text = shopContainer;
        
            options.push({
                "text" : "Continue",
                "onSelect" : "_next-event"
            });
            ui.setEventPlayerOptions(options);
            ui.switchScene(GAME_CONSTANTS.GAME_STATES.EVENT);
        }
        static loadUpgradeShop(args) {
            let shopContainer = $("<div>");
            shopContainer.attr("id", "shop-container")
        
            let shopPrompt = $("<div></div>");
            shopPrompt.attr("id", "shop-prompt");
            shopPrompt.text("Choose a blessing......");
        
            let modifiersContainers = $("<div>");
            modifiersContainers.attr("id", "shop-modifiers-container");
        
            // generate 3 random modifiers
            let modifiers = _.sampleSize(Object.keys(MODIFIERS), 3);
            for (const mod of modifiers) {
                let m = MODIFIERS[mod];
                let modifierContainer = $("<div>");
                modifierContainer.addClass("modifier-container");
                modifierContainer.attr("_modifierid", mod)
        
                let modifierName = $("<div>");
                modifierName.addClass("modifier-name");
                modifierName.text(m.name);
        
                let modifierSprite = $("<img>");
                modifierSprite.addClass("modifier-sprite");
                modifierSprite.attr("src", m.sprite);
        
                modifierContainer.append(modifierName, modifierSprite);
                modifiersContainers.append(modifierContainer);
            }
        
            shopContainer.append(shopPrompt, modifiersContainers);
        
            // generate 6 letters to apply the modifiers to
            let letters = _.sampleSize(Letter.ALPHABET_SET, 6);
            let upgradeLetterContainer = $("<div>");
            upgradeLetterContainer.attr("id", "modifier-letter-container");
        
            for (const l of letters) {  
                let letter = new Letter(l);
                upgradeLetterContainer.append(letter.generateElement());
            }
        
            // submit modifier
            let submitModifierButton = $("<button>");
            submitModifierButton.attr("id", "modifier-submit");
            if (args && args.returnToSavedState) {
                submitModifierButton.attr("data-return-state", args.returnToSavedState);
            }
            submitModifierButton.text("Submit");
            submitModifierButton.addClass("bottom-row-button")
            let bottomRowContainer = $("<div>");
            bottomRowContainer.attr("id", "bottom-row-buttons-container");
            bottomRowContainer.append(submitModifierButton)
        
            let modifierLetterContainer = $("<div>");
            modifierLetterContainer.attr("id", "modifier-letter-container");
            
            modifierLetterContainer.append(upgradeLetterContainer, bottomRowContainer);
            
            ui.sceneStore.event.text = shopContainer;
            ui.sceneStore.event.options = modifierLetterContainer;
            ui.switchScene(GAME_CONSTANTS.GAME_STATES.EVENT);
        }
        static modifyLetterOnClick(e) {
            let j = $(e.target);
    
            // unselect everything else
            let otherLetters = j.siblings();
            otherLetters.attr("data-selected", "false");
            otherLetters.css("border", "")
    
            // toggle selected on target
            if (j.attr("data-selected") == "true") {
                j.attr("data-selected", "false");
                j.css("border", "");
                selectedLetter = null;
            } else {
                j.attr("data-selected", "true");
                j.css("border", "5px solid orange");
                selectedLetter = j.text();
            }
        }
        static modifierOnClick(e) {
            let j = $(e.currentTarget);
    
            // deselect everything else
            let otherModifiers = j.siblings();
            otherModifiers.attr("data-selected", "false");
            otherModifiers.css("border", "");
    
            // toggle selected
            if (j.attr("data-selected") == "true") {
                j.attr("data-selected", "false");
                j.css("border", "");
                selectedModifier = null;
            } else {
                j.attr("data-selected", "true");
                j.css("border", "3px solid orange");
                selectedModifier = j.attr("_modifierid");
            }
        }
    }
    removeStartButton() {
        return $("#game-start").remove();
    }
    
    enableTooltips() {
        tippy.delegate('body', {
            target : ".hover-tooltip",
            content(reference) {
                let content = reference.getAttribute("data-tooltip-content");
                return content;
            },
            placement : "right",
            flip : true,
        });
    }

    setSubmitButtonEnabled(state) {
        $("#send-input").prop("disabled", !state);
    }
}
