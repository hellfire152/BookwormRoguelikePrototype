const COMMON_RELICS = {
    RECONSIDER : "R_001",
    CHARISMA : "R_002",
    ACTIONABLE : "R_003",
    HAMMER : "R_004",
    SHINY_HAMMER : "R_005",
    DETERMINATION : "R_006",
    PEN_NIB : "R_007",
    IGNORANCE : "R_008",
    HOLISTIC_EDUCATION : "R_009",
    ALCHEMY_FLASK : "R_010",
    SUPERCALIFRAGILISTICEXPIALIDOCIOUS : "R_011",
    JUST_SAY_NO : "R_012",
    REROLL : "R_013",
    EMPHASIS : "R_014",
    FULL_ASSESSMENT : "R_015",
    AVOWED : "R_016",
    PRETENTIOUS : "R_017",
    MONEY_IS_POWER : "R_018"
}

function getRandomRelic(alreadyHave) {
    // remove the relics that are already present
    let commonRelics = {};
    Object.assign(copy, commonRelics);

    for(const r in commonRelics) {
        if (alreadyHave.has(commonRelics[r])) {
            commonRelics[r] = undefined;
        }
    }

    //random relic from everything left
    let relicKeys = Object.keys(commonRelics);
    return commonRelics[relicKeys[ relicKeys.length * Math.random() << 0 ]];
}