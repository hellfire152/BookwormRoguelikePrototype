class UI {
    static sceneStore = {
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

    static preloadElements() {
        UI._generateInputSpace();
        UI._generatePlayerStatBoard();
        UI._generateEventDetail();
        UI._generateEnemyContainer();
        UI._generateLog();
    }

    static setupEvent(eventName) {
        let eventDetails = EVENT_DETAILS[eventName];
        UI.setEventPrompt(eventDetails.prompt);
        UI.setEventPlayerOptions(eventDetails.options);
    
        UI.switchScene(GAME_CONSTANTS.GAME_STATES.EVENT);
    }
    
    static setEventPrompt(text) {
        $(UI.sceneStore.event.text).text(text);
    }
    static setEventPlayerOptions(optionsArr) {
        // clear options
        let eventOptionsContainer = $(UI.sceneStore.event.options);
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

    static _generateEventDetail() {
        //top half display
        let eventContainer = $("<div></div>");
        eventContainer.attr("id", "event-detail-container");
    
        let eventDetail = $("<div></div>");
        eventDetail.attr("id", "event-detail-text");
    
        eventContainer.append(eventDetail);
        UI.sceneStore.event.text = eventContainer;
    
        let eventOptionsContainer = $("<div></div>");
        eventOptionsContainer.attr("id", "event-options-container");
        UI.sceneStore.event.options = eventOptionsContainer;
    }

    static switchScene(sceneType) {
        // clear what's previously there
        $('#event-area').empty();
        $('#letter-board').empty();
    
        switch(sceneType) {
            case GAME_CONSTANTS.GAME_STATES.COMBAT:
                $("#event-area").append(UI.sceneStore.combat.enemy);
                $("#letter-board").append(UI.sceneStore.combat["player-input"])
                break;
            case GAME_CONSTANTS.GAME_STATES.EVENT:
                $("#event-area").append(UI.sceneStore.event.text);
                $("#letter-board").append(UI.sceneStore.event.options);
                break;
        }
    
    }

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
    
        for (const c of consumables) {
            let itemContainer = $("<div></div>");
            itemContainer.addClass("item-container");
            itemContainer.attr("_itemID", c);
    
            let itemName = $("<div></div>");
            itemName.addClass("item-name");
            itemName.text(CONSUMABLE_DETAILS[c].name);
    
            let itemSprite = $("<img>");
            itemSprite.attr("src", CONSUMABLE_DETAILS[c].sprite);
            itemSprite.addClass("item-sprite");
    
            let itemCost = $("<div>");
            itemCost.addClass("item-cost");
            itemCost.text(CONSUMABLE_DETAILS[c].baseCost);
    
            itemContainer.append(itemName, itemSprite, itemCost);
            shopItems.append(itemContainer);
    
            options.push({
                "text" : CONSUMABLE_DETAILS[c].name,
                "onSelect" : "purchase-item",
                "args" : `${c}|consumable`
            });
        }
    
        shopContainer.append(shopPrompt, shopItems);
        UI.sceneStore.event.text = shopContainer;
    
        options.push({
            "text" : "Continue",
            "onSelect" : "_next-event"
        });
        UI.setEventPlayerOptions(options);
        UI.switchScene(GAME_CONSTANTS.GAME_STATES.EVENT);
    }

    static loadUpgradeShop() {
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
        submitModifierButton.text("Submit");
    
        let modifierLetterContainer = $("<div>");
        modifierLetterContainer.attr("id", "modifier-letter-container");
        
        modifierLetterContainer.append(upgradeLetterContainer, submitModifierButton);
        
        UI.sceneStore.event.text = shopContainer;
        UI.sceneStore.event.options = modifierLetterContainer;
        UI.switchScene(GAME_CONSTANTS.GAME_STATES.EVENT);
    }

    static _generateEnemyContainer() {
        let enemyContainer = $("<div></div>");
        enemyContainer.attr("id", "enemy-container");
    
        let enemyName = $("<div></div>");
        enemyName.attr("id", "enemy-name");
    
        let enemyDisplay = $("<img>");
        enemyDisplay.attr("id", "enemy-display");
        enemyDisplay.addClass("hover-tooltip")
    
        let statusDisplay = $("<div>");
        statusDisplay.attr("id", "enemy-status-container");
    
        let enemyHP = $("<div></div>");
        enemyHP.attr("id", "enemy-hp");
    
        enemyContainer.append(enemyName, enemyHP, enemyDisplay, statusDisplay);
        UI.sceneStore.combat.enemy = enemyContainer;
    }
    
    static _generateInputSpace() {
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
        UI.sceneStore.combat["player-input"] = combatInputContainer;
    }

    static _generatePlayerStatBoard() {
        let statContainer = $("<div>");
        statContainer.attr("id", "player-stat-container");
    
        let hpDisplay = $("<div></div>");
        hpDisplay.attr("id", "player-hp");
        hpDisplay.text(`${player.currentHP}/${player.maxHP} HP`);
        hpDisplay.addClass("player-stat");
    
        let moneyDisplay = $("<div></div>");
        moneyDisplay.attr("id", "player-money");
        moneyDisplay.text(`${player.money} Money`);
        moneyDisplay.addClass("player-stat");
    
        let statusContainer = $("<div>");
        statusContainer.attr("id", "player-status-container");
    
        statContainer.append(hpDisplay, moneyDisplay);
        $("#log").append(statContainer, statusContainer);
    }

    static _generateLog() {
        let logDisplay = $("<div></div>");
        logDisplay.attr("id", "game-log");
    
        $("#log").append(logDisplay);
    }
    
    static getWordInInput() {
        let word = '';
        $('#letter-input').children().each((index, element) => {
            word += $(element).text();
        });
        return word;
    }

    // handles enemy UI stuff
    static Enemy = class UIEnemy {
        static initializeEnemyDisplay(enemy) {
            let enemyContainer = $(UI.sceneStore.combat.enemy);
            enemyContainer.find("#enemy-name").text(enemy.name);
            let display = enemyContainer.find("#enemy-display");
            display.attr("src", enemy.sprite);
            display.attr("data-tooltip-content", enemy.tooltip);
            enemyContainer.find("#enemy-hp").text(`${enemy.currentHP}/${enemy.maxHP} HP`)
        }

        static updateHPDisplay(enemy) {
            let hp = $(UI.sceneStore.combat.enemy).find("#enemy-hp");
            hp.text(`${enemy.currentHP}/${enemy.maxHP} HP`);
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
            console.log(letters)
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
            Utils.evaluateInput();
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
            Utils.evaluateInput();
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

    static appendLetterElement(letterElement) {
        $(UI.sceneStore.combat["player-input"])
        .find("#letters-available")
        .append(letterElement);
    }
    static removeStartButton() {
        return $("#game-start").remove();
    }
    
    static enableTooltips() {
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

    static setSubmitButtonEnabled(state) {
        $("#send-input").prop("disabled", state);
    }
}
