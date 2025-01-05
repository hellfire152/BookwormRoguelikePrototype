
class Shop {
    static modifySubmitOnClick(e) {
        let t = $(e.target);
        letterModifierHandler.addModifierFromId(selectedLetter, selectedModifier);
        if(t.attr("data-return-state")) {
            ui.loadPreviousSceneState(t.attr("data-return-state"));
        } else {
            director.signal("exit-shop");
        }
    }
}