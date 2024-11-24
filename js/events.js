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
        "prompt" : "Take this with you. (+50 Money)",
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
                "text" : "Item shop (unimplemented)",
                "onSelect" : "load_item_shop"
            },
            {
                "text" : "Upgrade shop (unimplemented)",
                "onSelect" : "load_upgrade_shop"
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
        setupEvent("_intro-conclusion");
    },
    "_next-event" : () => {
        nextEvent();
    },
    "_random-event" : () => {
        let allEvents = Object.keys(EVENT_DETAILS);
        let filteredEvents = allEvents.filter((e) => {
            return !e.startsWith("_")
        });

        //get a random event from remaining events
        let randomEvent = randomFromArray(filteredEvents);
        setupEvent(randomEvent);
    },
    "test_money" : () => {
        player.giveMoney(50);
        setupEvent("_test-money");
    },
    "test_heal" : () => {
        player.healDamage(10);
        setupEvent("_test-heal");
    },
    "load_item_shop" : () => {
        loadItemShop();
    },
    "load_upgrade_shop" : () => {
        loadUpgradeShop();
    },
    "purchase-item" : (target, args) => {
        let [itemID, type] = _.split(args, "|");
        let isPurchaseSuccessful = player.attemptPurchase(itemID, type);
        if (isPurchaseSuccessful) target.remove();
    }
}