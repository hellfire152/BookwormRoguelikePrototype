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

    setProgressDisplay(chapter, node) {
        let progressDisplay = $("#progress-display");
        progressDisplay.text(`Chapter ${chapter} - Part ${node}`);
    }

    decideNextNodeEvent(options) {
        let uiOptions = [];
        for (const o of options) {
            switch (o) {
                case "combat" : {
                    uiOptions.push({
                        text : "Take a fight",
                        onSelect : "combat-normal"
                    });
                    break;
                }
                case "elite" : {
                    uiOptions.push({
                        text : "Fight a strong enemy",
                        onSelect : "combat-elite"
                    });
                    break;
                }
                case "event" : {
                    uiOptions.push({
                        text : "Explore the area",
                        onSelect : "_random-event"
                    });
                    break;
                }
                case "itemShop" : {
                    uiOptions.push({
                        text : "Visit the items shop",
                        onSelect : "load-item-shop"
                    });
                    break;
                }
                case "abilityShop" : {
                    uiOptions.push({
                        text : "Visit the Abilities Shop",
                        onSelect : "load-ability-shop"
                    })
                    break;
                }
                case "upgradeShop" : {
                    uiOptions.push({
                        text : "Visit the upgrades shop",
                        onSelect : "load-upgrade-shop"
                    });
                    break;
                }
                case "treasure" : {
                    uiOptions.push({
                        text : "Get some treasure",
                        onSelect : "treasure-event"
                    });
                    break;
                }
                case "boss" : {
                    uiOptions.push({
                        text : "Fight the boss",
                        onSelect : "combat-boss"
                    });
                    break;
                }
            }
        }
        this.setupDynamicEvent({
            prompt : "Decide the next event...",
            options : uiOptions
        })
    }
    // for events with static prompt and option text
    setupEvent(eventName) {
        let eventDetails = EVENT_DETAILS[eventName];
        this.setupDynamicEvent(eventDetails);
    }
    // use this if the event description and option text have to be
    // dynamically generated i.e. battle rewards
    setupDynamicEvent(eventDetail) { 
        let container = $("<div>");
        container.addClass("event-detail-container");

        let prompt = $("<div>");
        prompt.text(eventDetail.prompt);
        prompt.addClass("event-prompt");

        let sprite = $("<img>");
        sprite.attr("src", eventDetail.sprite);
        sprite.addClass("event-sprite");

        let postPrompt = $("<div>");
        postPrompt.text(eventDetail.postPrompt);
        postPrompt.addClass("event-post-prompt");

        container.append(prompt);
        if (eventDetail.sprite) container.append(sprite);
        if (eventDetail.postPrompt) container.append(postPrompt);

        this.setCustomEventPrompt(container);
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
        this._tempSceneStore = {
            "combat" : {
                "enemy" : $(this.sceneStore.combat.enemy).clone(),
                "player-input" : $(this.sceneStore.combat["player-input"]).clone(),
            },
            "event" : {
                "text" : $(this.sceneStore.event.text).clone(),
                "options" : $(this.sceneStore.event.options).clone(),
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
        director.tempGameState = director.gameState;
    }
    loadPreviousSceneState(gameState) {
        gameState = gameState || director.tempGameState;
        this.sceneStore = this._tempSceneStore;
        //this._tempSceneStore = null;
        director.tempGameState = null;
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
        sendInput.text("Submit");
    
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
    
        let rerollButton = $("<button>");
        rerollButton.attr("id", "reroll");
        rerollButton.text("Reroll (5)");
        rerollButton.addClass("bottom-row-button");

        bottomButtonsContainer.append(refreshButton, shuffleButton, rerollButton);
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
            enemyContainer.css("opacity", "100%");
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
        static updateMoneyDisplay(money) {
            $("#player-money").text(`${money} Money`)
        }
        static abilityOverflow(abilities, gameState, skipSaveState = false) {
            if (!skipSaveState) ui.saveCurrentSceneState();

            // generate display
            let abilityOverflowContainer = $("<div>");
            abilityOverflowContainer.attr("id", "ability-overflow-container");

            let abilityOverflowPrompt = $("<div>");
            abilityOverflowPrompt.attr("id", "ability-overflow-prompt");
            abilityOverflowPrompt.text("Too many abilities! Choose one to remove");

            let abilitiesContainer = $("<div>");
            abilitiesContainer.attr("id", "ability-overflow-abilities-container");
            
            for (const a of abilities) {
                let abilityContainer = $("<div>");
                abilityContainer.addClass("ability-overflow-ability-container");
                abilityContainer.attr("data-ability-id", a.id);

                abilityContainer.append(a.generateElement(false));
                abilitiesContainer.append(abilityContainer);
            }

            // submit button
            let submitAbilityButton = $("<button>");
            submitAbilityButton.text("Submit");
            submitAbilityButton.attr("id", "ability-overflow-submit");
            submitAbilityButton.attr("data-return-state", gameState);
            submitAbilityButton.addClass("bottom-row-button");

            let bottomRowContainer = $("<div>");
            bottomRowContainer.attr("id", "bottom-row-buttons-container");
            bottomRowContainer.append(submitAbilityButton);

            let container = $("<div>")
            container.attr("id", "ability-overflow-submit-container");
            container.append(bottomRowContainer);

            abilityOverflowContainer.append(abilityOverflowPrompt, abilitiesContainer);
            ui.sceneStore.event.text = abilityOverflowContainer;
            ui.sceneStore.event.options = container;
            ui.switchScene(GAME_CONSTANTS.GAME_STATES.EVENT);
        }
    }

    static Letter = class UILetter {
        static getLetters() {
            return $(".letter:not(.placeholder-letter)");
        }
        static getLetterObjects() {
            let letters = UI.Letter.getLetters();
            letters = letters.toArray().map((l) => {
                return Letter.getLetterObjectFromElement(l);
            })
            return letters;
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
            UI.Letter.checkValidWordAndSetSubmitButton(ui.getWordInInput());
        }
        static letterAvailableOnClick(e) {
            let t = $(e.target);
            // skip placeholder letters
            if (t.attr("_pfor")) {
                return;
            }
            // handling locked tiles
            let l = Letter.getLetterObjectFromElement(t);
            if (l.lockedState) return l.lockedOnClick(t);

            // generate a new blank letter to replace it with
            let placeholder = new Letter("", SPECIAL_TILE_TYPES.UNSELECTABLE);
            placeholder.placeholder_for = t.attr("_letterref");
    
            t.replaceWith(placeholder.generateElement());
            
            $('#letter-input').append(t);
            let word = ui.getWordInInput();

            UI.Letter.checkValidWordAndSetSubmitButton(word);
        }
        static checkValidWordAndSetSubmitButton(word) {
            // relic bonus indicators
            for (const r of relicHandler.ownedRelicsArr) {
                r.checkWordBonus(word);
            }

            // companion bonus indicators
            for (const c of companionHandler.companionArr) {
                companionHandler.rerenderCompanion(c.id, c.isBonusWord(word));
            }


            let isValid = Utils.evaluateInput(word);
            if (isValid) {
                ui.setSubmitButtonEnabled(true);
            } else {
                ui.setSubmitButtonEnabled(false);
            }
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
        static unselectAllLetters() {
            UI.Letter.getLetterElementsInInput().trigger("click");
        }
        // used in the longest word search logic
        static getAvailableLetterObjects() {
            let letterElements = UI.Letter.getAvailableLetterElements();
            let letterObjects = []
            for (const le of letterElements) {
                letterObjects.push(Letter.getLetterObjectFromElement(le));
            }
            return letterObjects;
        }

        // for use in effects that pick one letter out of all 26 letters
        static singleLetterPickerSelector(prompt, effectFunction, saveState = true) {
            let gameState = director.gameState;
            if (saveState) ui.saveCurrentSceneState();

            ui.setEventPrompt(prompt);
            
            let letterContainer = $("<div>");
            for (const l of Letter.ALPHABET_SET) {
                let letter = new Letter(l);
                letterContainer.append(letter.generateElement());
            }
            

            ui.sceneStore.event.options = letterContainer;
            ui.switchScene(GAME_CONSTANTS.GAME_STATES.EVENT);

            let _l = letterContainer.find(".letter")
            _l.one('click', (e) => {
                let t = $(e.currentTarget);
                effectFunction(t.text());
                _l.off("click");
                ui.loadPreviousSceneState(gameState);
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

        static updateSingleRelic(relic) {
            let relicContainer = $(`.relic-container[data-relic-id="${relic.id}"]`);
            relicContainer.replaceWith(relic.generateElement());
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

        static abilityOverflowAbilityOnClick(e) {
            let j = $(e.currentTarget);

            // unselect everything else
            let otherLetters = j.siblings();
            otherLetters.attr("data-ability-overflow-selected", "false");
            otherLetters.css("border", "");

            if (j.attr("data-ability-overflow-selected") == "true") {
                j.attr("data-ability-overflow-selected", "false");
                j.css("border", "");
                selectedAbility = null;
            } else {
                j.attr("data-ability-overflow-selected", "true");
                j.css("border", "3px solid blue");
                selectedAbility = j.attr("data-ability-id");
            }
        }
    }
    static Shop = class UIShop {
        static loadItemShop() {
            let shopContainer = $("<div></div>");
            shopContainer.attr("id", "shop-container");
        
            let shopPrompt = $("<div>");
            shopPrompt.attr("id", "shop-text");
            shopPrompt.text("ITEM SHOP\n----------------");
        
            let shopItems = $("<div></div>");
            shopItems.attr("id", "shop-items-container");
         
            //generate 3 random relics and 3 random consumables
            let options = [];
            let consumables = _.sampleSize(CONSUMABLE_ID, 3).sort();
            let relics = _.sampleSize(Object.values(RELIC_ID), 3);

            for (const cid of consumables) {
                let consumable = ConsumableFactory.generateConsumable(cid);
                shopItems.append(consumable.generateElement(true));
        
                options.push({
                    "text" : consumable.name,
                    "onSelect" : "purchase-item",
                    "args" : `${cid}@consumable`
                });
            }

            for (const r of relics) {
                let relicObj = RelicFactory.generateRelic(r);
                let relicContainer = relicObj.generateElement(true);
                shopItems.append(relicContainer);

                options.push({
                    "text" : relicObj.name,
                    "onSelect" : "purchase-item", 
                    "args" : `${r}@relic`
                })
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
        static loadAbilityShop(args) {
            let shopContainer = $("<div></div>");
            shopContainer.attr("id", "shop-container");
        
            let shopPrompt = $("<div>");
            shopPrompt.attr("id", "shop-text");
            shopPrompt.text("UPGRADE SHOP\n----------------");
        
            let shopItems = $("<div></div>");
            shopItems.attr("id", "shop-items-container");
         
            //generate 3 random abilities
            let options = [];
            let abilities = AbilityFactory.getRandomUnownedAbilities(3);

            for (const a of abilities) {
                let abilityContainer = a.generateElement(false, true);
                shopItems.append(abilityContainer);

                options.push({
                    "text" : a.name,
                    "onSelect" : "purchase-item", 
                    "args" : `${a.id}@ability`
                })
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
        static loadUpgradeReward(args) {
            let shopContainer = $("<div>");
            shopContainer.attr("id", "shop-container")
        
            let shopPrompt = $("<div></div>");
            shopPrompt.attr("id", "shop-prompt");
            shopPrompt.text("Choose an upgrade...\n----------------");
        
            let modifiersContainers = $("<div>");
            modifiersContainers.attr("id", "shop-modifiers-container");
        
            // generate 3 random modifiers from common upgrades
            let modifiers = _.sampleSize(COMMON_UPGRADES, 3);
            for (const mod of modifiers) {
                let lu = LetterModifier.generateModifier(MODIFIER_ID[mod]);
                modifiersContainers.append(lu.generateShopElement());
            }
        
            shopContainer.append(shopPrompt, modifiersContainers);
        
            // generate letters to apply the modifiers to
            let letters = _.sampleSize(Letter.ALPHABET_SET, GAME_CONSTANTS.UPGRADE_LETTERS_OFFERRED_COUNT);
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
            } else if (args.createNextOption) {
                submitModifierButton.attr("data-create-next-option", "true");
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
        static loadUpgradeShop(data) {
            // same as upgrade reward screen
            let shopContainer = $("<div>");
            shopContainer.attr("id", "upgrade-shop-container")
        
            let shopPrompt = $("<div></div>");
            shopPrompt.attr("id", "shop-prompt");
            shopPrompt.text("Choose a blessing......");
        
            let modifiersContainers = $("<div>");
            modifiersContainers.attr("id", "upgrade-shop-modifiers-container");
        
            let options = [];
            // generate 4 common 2 rare letter upgrades
            let modifiers = _.sampleSize(COMMON_UPGRADES, 4);
            for (const mod of modifiers) {
                let lm = LetterModifier.generateModifier(MODIFIER_ID[mod]);
                let e = lm.generateShopElement(true);
                e.addClass("upgrade-shop-modifier");
                modifiersContainers.append(e);

                options.push({
                    text : lm.name,
                    onSelect : "upgrade-shop-purchase",
                    args : lm.id
                })
            }
        
            shopContainer.append(shopPrompt, modifiersContainers);
            ui.sceneStore.event.text = shopContainer;
            
            if (data.customOptions) {
                options.push(customOption)
            }
            options.push({
                "text" : "Continue",
                "onSelect" : "_next-event"
            });
            ui.setEventPlayerOptions(options);
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

    static Stats = class UIStats {
        static loadProbabilityModal() {
            let container = $("#stat-screen-letter");
            container.empty();
            let title = $("<h1 id='stat-screen-letter-title'>Letter Stats</h1>");
            container.append(title);
            container.append("<hr>")
            for (const l in LETTER_PROBABILITY_POINTS) {
                let probability = Utils.roundToOneDP((LETTER_PROBABILITY_POINTS[l] / LETTER_PROBABILITY_POINT_MAX) * 100);
                let damage = LETTER_DAMAGE_VALUES[l];
                let letterContainer = $("<div>");
                letterContainer.addClass("stat-letter-container");

                let letterLabel = $("<div>");
                letterLabel.addClass("stat-letter-label");
                letterLabel.text(l.toUpperCase());

                let letterProbabilityContainer = $(
                    `<div class="stat-letter-stat-container">
                        <span class="stat-screen-stat-label">P</span><span class="stat-screen-stat-value">${probability}%</span>
                    </div>`);
                
                let letterDamageContainer = $(
                    `<div class="stat-letter-stat-container">
                        <span class="stat-screen-stat-label">D</span><span class="stat-screen-stat-value">${damage}</span>
                    </div>`
                )

                letterContainer.append(letterLabel, letterProbabilityContainer, letterDamageContainer);
                container.append(letterContainer);
            }
        }
    }

    static Companion = class UICompanion {
        static updateDisplay(companions) {
            $("#companions-container").empty();

            for (const c of Object.values(companions)) {
                console.log(c.generateElement())
                $("#companions-container").append(c.generateElement());
            }
        }

        static updateSingleCompanion(companion) {
            let companionContainer = $(`.companion-container[data-companion-id="${companion.id}"]`);
            companionContainer.replaceWith(companion.generateElement());
        }
    }

    updateRerollCount(rerollsLeft) {
        $("#reroll").text(`Reroll (${rerollsLeft})`);
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

    setRefreshButtonText(text) {
        let refreshButton = $("#refresh");
        if (text) {
            refreshButton.text(text);
        } else {
            refreshButton.text("Refresh (skips turn!)");
        }
    }

    loadRewardChoices(prompt, rewardOptions, rewardType) {
        let options = [];

        // reusing the shop-container css stuff
        let shopContainer = $("<div></div>");
        shopContainer.attr("id", "shop-container");
    
        let shopPrompt = $("<div>");
        shopPrompt.attr("id", "shop-text");
        shopPrompt.text(prompt);
    
        let shopItems = $("<div></div>");
        shopItems.attr("id", "shop-items-container");

        for (const r of rewardOptions) {
            shopItems.append(r.generateElement(true));

            options.push({
                text : r.name,
                onSelect : "reward-choice",
                args : `${r.id}@${rewardType}`
            })
        }

        shopContainer.append(shopPrompt, shopItems);
        this.setCustomEventPrompt(shopContainer);
        this.setEventPlayerOptions(options);
        this.switchScene(GAME_CONSTANTS.GAME_STATES.EVENT);
    }
}
