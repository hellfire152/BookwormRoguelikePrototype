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
                "text" : "Upgrade shop",
                "onSelect" : "load-upgrade-shop"
            },
            {
                "text" : "Explore the area",
                "onSelect" : "_random-event"
            }
        ]
    },
}

const EVENT_FUNCTIONS = {
    "intro_1" : () => {
        player.giveMoney(50);
        relicHandler.addRelic(RELIC_ID.HEAVY_METAL);
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
        UI.loadItemShop();
    },
    "load-upgrade-shop" : () => {
        UI.loadUpgradeShop();
    },
    "purchase-item" : (target, args) => {
        let [itemID, type] = _.split(args, "|");
        let isPurchaseSuccessful = player.attemptPurchase(itemID, type);
        if (isPurchaseSuccessful) target.remove();
    }
}