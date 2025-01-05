const EVENT_DETAILS = {
    "_intro" : {
        "prompt" : "This is a test event! Please don't mind",
        "options" : [
            {
                "text" : "Acknowledge.",
                "onSelect" : "intro_1",
            }
        ]
    },
    "_intro-conclusion" : {
        "prompt" : "Take this with you. (+50 Money, test relic)",
        "options" : [
            {
                "text" : "Acknowledge.2",
                "onSelect" : "_next-event"
            }
        ]
    },
    "test_event" : {
        "prompt" : "Test event",
        "options" : [
            {
                "text" : "Just take some money",
                "onSelect" : "test_money"
            },
            {
                "text" : "Heal some HP",
                "onSelect" : "test_heal"
            }
        ]
    },
    "_test-money" : {
        "prompt" : "You take 50 Money",
        "options" : [
            {
                "text" : "Move on.",
                "onSelect" : "_next-event"
            }
        ]
    },
    "_test-heal" : {
        "prompt" : "You heal 10 HP",
        "options" : [
            {
                "text" : "Move on.",
                "onSelect" : "_next-event"
            }
        ]
    },
    "_decide-event" : {
        "prompt" : "Select the next event",
        "options" : [
            {
                "text" : "Item shop",
                "onSelect" : "load-item-shop"
            },
            {
                "text" : "Explore the area",
                "onSelect" : "_random-event"
            }
        ]
    },
    "_treasure-event" : {
        "prompt" : "Treasure!",
        "options" : [
            {
                "text" : "Obtain a random ability",
                "onSelect" : "treasure-ability"
            },
            {
                "text" : "Obtain a random relic",
                "onSelect" : "treasure-relic"
            },
            {
                "text" : "Move On",
                "onSelect" : "_next-event"
            }
        ]
    }
}


const EVENT_FUNCTIONS = {
    "intro_1" : () => {
        player.giveMoney(50);
        //relicHandler.addRelic(RELIC_ID.HEAVY_METAL);
        director.setupEvent("_intro-conclusion");
    },
    "_next-event" : () => {
        director.signal("event-complete");
    },
    "_random-event" : () => {
        let allEvents = Object.keys(EVENT_DETAILS);
        let filteredEvents = allEvents.filter((e) => {
            return !e.startsWith("_")
        });

        //get a random event from remaining events
        let randomEvent = _.sample(filteredEvents);
        director.setupEvent(randomEvent);
    },
    "test_money" : () => {
        player.giveMoney(50);
        director.setupEvent("_test-money");
    },
    "test_heal" : () => {
        player.healDamage(10);
        director.setupEvent("_test-heal");
    },
    "load-item-shop" : () => {
        UI.Shop.loadItemShop();
    },
    "load-upgrade-shop" : () => {
        UI.Shop.loadUpgradeShop();
    },
    "purchase-item" : (target, args) => {
        let [itemID, type] = _.split(args, "@");
        let isPurchaseSuccessful = player.attemptPurchase(itemID, type);
        if (isPurchaseSuccessful) $(target).remove();
    },
    "combat-reward-money" : (target, money) => {
        target.remove();
        player.giveMoney(money);
        log(`Gained ${money} money`);
    },
    "combat-reward-heal" : (target, heal) => {
        target.remove();
        player.healDamage(heal);
        log(`Healed for ${heal} HP`);
    },
    "combat-reward-charge" : (target, charge) => {
        target.remove();
        player.gainCharge(charge);
        log(`Gained ${charge} Charge`);
    }, 
    "combat-reward-upgrade" : (target) => {
        // first remove the button that loads the upgrade shop
        target.remove();
        ui.saveCurrentSceneState();
        UI.Shop.loadUpgradeShop({returnToSavedState : GAME_CONSTANTS.GAME_STATES.EVENT});
    },
    "combat-complete" : () => {
        director.signal("combat-complete");
    },
    "load-previous-scene-state" : (gameState) => {
        ui.loadPreviousSceneState(gameState);
    }, 
    "combat-normal" : () => {
        director.setupCombat();
    },
    "combat-elite" : () => {
        director.setupCombat();
    },
    "combat-boss" : () => {
        director.setupCombat();
    },
    "treasure-event" : () => {
        director.setupEvent("_treasure-event");
    },
    "treasure-ability" : (target) => {
        target.remove();

        // pick one of 3 abilities
        ui.saveCurrentSceneState();

        let abilities = AbilityFactory.getRandomUnownedAbilities(3);
        ui.loadRewardChoices("Get a new Ability", abilities, "ability");       
    },
    "treasure-relic" : (target) => {
        target.remove();

        // pick one of 3 relics
        ui.saveCurrentSceneState();

        let relics = RelicFactory.getRandomUnownedRelic(3);
        ui.loadRewardChoices("Obtain a new relic", relics, "relic")
    },
    "reward-choice" : (target, args) => {
        target.remove();
        let [itemID, type] = args.split("@");
        let returnState = true;
        switch(type) {
            case "ability" : {
                returnState = player.newAbility(itemID);
                break;
            }
            case "relic" : {
                returnState = relicHandler.addRelic(itemID);
                break;
            }
            default : {
                throw new Error("Invalid reward type!");
            }
        }
        ui.loadPreviousSceneState();
    }
}