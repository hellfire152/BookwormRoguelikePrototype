const EVENT_DETAILS = {
    "intro" : {
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
                "onSelect" : "intro_2"
            }
        ]
    }
}

const EVENT_FUNCTIONS = {
    "intro_1" : () => {
        player.giveMoney(50);
        setupEvent("_intro-conclusion");
    },
    "intro_2" : () => {
        nextEvent();
    }
}