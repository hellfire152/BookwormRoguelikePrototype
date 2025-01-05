class RefreshButton {
    static refreshButtonOnClick(e) {
        Letter.refreshAllLetters(true);
        let coinRelic = relicHandler.getRelic(RELIC_ID.COIN);
        if (coinRelic && coinRelic.isActive) {
            coinRelic.update(false);
            ui.setRefreshButtonText();
            return;
        }
        combatHandler.handleTurn(true);
    }
}