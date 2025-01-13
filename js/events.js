const nextEventEventOption = {
    "text" : "Move On.",
    "onSelect" : "_next-event"
}
const EVENT_DETAILS = {
    "_intro" : {
        "prompt" : "This is a test event! Please don't mind",
        "postPrompt" : "Test post prompt",
        "sprite" : "./sprites/enemies/MC.png",
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
    "_test_event" : {
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
            nextEventEventOption
        ]
    },
    "_test-heal" : {
        "prompt" : "You heal 10 HP",
        "options" : [
            nextEventEventOption
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
            nextEventEventOption
        ]
    },
    "pit-stop" : {
        "prompt" : "You arrive at a pit stop. Time to take a break",
        "postPrompt" : "What do you do?",
        "sprite" : "./effect/Questionmorks.png",
        "options" : [
            {
                "text" : "Rest your body (Heal 15 HP)",
                "onSelect" : "pit-stop-heal"
            },
            {
                "text" : "Regain your focus (Gain 30 charge)",
                "onSelect" : "pit-stop-charge"
            },
            {
                "text" : "Spend the time studying (Upgrade a letter)",
                "onSelect" : "pit-stop-upgrade"
            }
        ]
    },
    "_pit-stop-heal-select" : {
        "prompt" : "You lay down and rest. Healed 15 HP.",
        "sprite" : null,
        "options" : [nextEventEventOption]
    },
    "_pit-stop-charge-select" : {
        "prompt" : "You meditate for a while. Gained 30 charge.",
        "sprite" : null,
        "options" : [nextEventEventOption]
    },
    "_pit-stop-upgrade" : {
        "prompt" : "You feel slightly more powerful.",
        "sprite" : null,
        "options" : [nextEventEventOption]
    },
    "casino" : {
        "prompt" : "You pass by a building, inside you see rows upon rows of blinding lights and sounds. You've walked by a casino!",
        "postPrompt" : "What do you do?",
        "sprite" : null,
        "options" : [
            {
                "text" : "Try your luck (Gamble 50% of your money)",
                "onSelect" : "_casino-small-gamble"
            },
            {
                "text" : "All in (Gamble 100% of your money)",
                "onSelect" : "_casino-large-gamble"
            },
            {
                "text" : "Cause some trouble (enter combat)",
                "onSelect" : "_casino-combat"
            },
            nextEventEventOption
        ]
    },
    "_casino-small-gamble-win" : {
        "prompt" : "Congratulations! You won!",
        "sprite" : null,
        "options" : [nextEventEventOption]
    },
    "_casino-small-gamble-loss" : {
        "prompt" : "You lost. Welp.",
        "sprite" : null,
        "options" : [nextEventEventOption]
    },
    "_casino-large-gamble-win" : {
        "prompt" : "You did it! You've won!",
        "sprite" : null,
        "options" : [nextEventEventOption]
    },
    "_casino-large-gamble-loss" : {
        "prompt" : "You've lost everything.",
        "sprite" : null,
        "options" : [nextEventEventOption]
    },
    "abandoned-building" : {
        "prompt" : "You come across an abandoned building. A mysterious light emanates from within",
        "postPrompt" : "Do you investigate?",
        "sprite" : null,
        "options" : [
            {
                "text" : "Search the surroundings (Obtain a common relic)",
                "onSelect" : "abandoned-building-common-reward"
            },
            {
                "text" : "Enter the building and do a cursory search (70% for an uncommon relic)",
                "onSelect" : "abandoned-building-uncommmon-reward"
            },
            {
                "text" : "Attempt to locate the source",
                "onSelect" : "abandoned-building-rare-reward"
            }
        ]
    },
    "_abandoned-building-common-reward-select" : {
        "prompt" : "You find strange items scattered around the perimeter. You decide to pick one of them up.",
        "sprite" : null,
        "options" : [nextEventEventOption]
    },
    "_abandoned-building-uncommon-reward-success" : {
        "prompt" : "You find something useful in one of the rooms!",
        "sprite" : null,
        "options" : [nextEventEventOption]
    },
    "_abandoned-building-uncommon-reward-failure" : {
        "prompt" : "You find nothing of use.",
        "sprite" : null,
        "options" : [nextEventEventOption]
    },
    "_abandoned-building-rare-reward-success" : {
        "prompt" : "You find a data bank inside, somehow still functional. You can't stay for long, so you pick up a mysterious item before you leave.",
        "sprite" : null,
        "options" : [nextEventEventOption]
    },
    "_abandoned-building-rare-reward-failure" : {
        "prompt" : "Before you reach your goal, you are suddenly zapped unconscious, and find yourself outside.",
        "sprite" : null,
        "options" : [nextEventEventOption]
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
        UI.Shop.loadUpgradeReward({returnToSavedState : GAME_CONSTANTS.GAME_STATES.EVENT});
    },
    "combat-reward-relic" : (target, relicId) => {
        target.remove();
        // in case the relic onObtain opens a new screen and needs to load state
        ui.saveCurrentSceneState();
        relicHandler.addRelic(relicId);
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
        director.setupCombat("elite");
    },
    "combat-boss" : () => {
        director.setupCombat("boss");
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

        let relics = relicHandler.getRandomUnownedRelic(3);
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
        if (returnState) ui.loadPreviousSceneState();
    },
    "upgrade-shop-purchase" : (target, modId) => {
        let modifier = LetterModifier.generateModifier(modId);
        if (player.money >= modifier.shopCost) {
            target.remove();
            // also remove the shop display element
            $(`.upgrade-shop-modifier[_modifierId="${modId}"]`).remove();

            // when purchasing an upgrade, you can choose exactly which letter to apply it to        
            UI.Letter.singleLetterPickerSelector("Select the letter to apply the upgrade to", (letter) => {
                letterModifierHandler.addModifier(letter, modifier);
                player.money -= modifier.shopCost;
            });
        } else {
            log(`Cannot afford upgrade ${modifier.name}`);
        }
    },
    "pit-stop-heal" : (target) => {
        player.healDamage(15);
        director.setupEvent("_pit-stop-heal-select");
    },
    "pit-stop-charge" : (target) => {
        player.gainCharge(30);
        director.setupEvent("_pit-stop-charge-select");
    },
    "pit-stop-upgrade" : (target) => {
        UI.Shop.loadUpgradeReward({createNextOption : true});
    },
    "_casino-small-gamble" : (target) => {
        if (Math.random() < 0.5) {
            // win gamble
            player.money *= 1.5
            director.setupEvent("_casino-small-gamble-win");
        } else {
            // lose gamble
            player.money /= 2;
            director.setupEvent("_casino-small-gamble-loss");
        }
    },
    "_casino-large-gamble" : (target) => {
        if (Math.random() < 0.5) {
            //win
            player.money *= 2;
            director.setupEvent("_casino-large-gamble-win");
        } else {
            player.money = 0;
            director.setupEvent("_casino-large-gamble-loss");
        }
    },
    "_casino-combat" : (target) => {
        director.setupCombat("normal", null, true);
    },
    "abandoned-building-common-reward" : (target) => {
        let relic = relicHandler.getRandomUnownedRelic(1, "common");
        relicHandler.addRelic(relic[0].id);
        director.setupEvent("_abandoned-building-common-reward-select");
    },
    "abandoned-building-uncommon-reward" : (target) => {
        if (Math.random() < 0.7) {
            // get reward
            let relic = relicHandler.getRandomUnownedAbilities(1, "uncommon");
            relicHandler.addRelic(relic[0].id);
            director.setupEvent("_abandoned-building-uncommon-reward-success");
        } else {
            director.setupEvent("_abandoned-building-uncommon-reward-failure");
        }
    },
    "abandoned-building-rare-reward" : (target) => {
        if (Math.random() < 0.4) {
            let relic = relicHandler.getRandomUnownedRelic(1, "rare");
            relicHandler.addRelic(relic[0].id);
            director.setupEvent("_abandoned-building-rare-reward-success");
        } else {
            player.dealDamage(player.currentHP * 0.3);
            player.removeCharge(player.currentCharge / 2);
            director.setupEvent("_abandoned-building-rare-reward-failure");
        }
    }
}