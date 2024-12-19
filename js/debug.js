// this file is to add any debug functions called directly from the console

function testTileEffect() {
    player.applyTileEffect(TILE_EFFECTS.CURSED, (letters) => {
        let unlockedLetters = _.filter(letters, (l) => {
            let e = Letter.getLetterObjectFromElement(l);
            return !e.lockedState;
        })
        return _.sampleSize(unlockedLetters, 3);
    }, {duration : 3, cost: 3, damage : 5});
}