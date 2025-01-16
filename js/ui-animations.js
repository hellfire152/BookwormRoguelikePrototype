class Anim {
    static enemyDamageNumber(value, type) {
        let tc = "enemy-damage-number";
        let damageNumberContainer = $("<p>");
        damageNumberContainer.addClass(tc);
        damageNumberContainer.text("-" + value);
        if (type == "poison") damageNumberContainer.addClass("poison-damage-number");
        Anim.enemyHPNumberAnim(damageNumberContainer, tc);
    }

    static enemyHealNumber(value) {
        let tc = "enemy-heal-number";
        let healNumberContainer = $("<p>");
        healNumberContainer.addClass(tc);
        healNumberContainer.text("+" + value);
        Anim.enemyHPNumberAnim(healNumberContainer, tc);
    }

    static enemyHPNumberAnim(element, targetClass) {
        let enemyDisplayRect = $("#enemy-display")[0].getBoundingClientRect();
        let width = $("#enemy-display").width();
        element.offset({
            top : enemyDisplayRect.top - 30,
            left : enemyDisplayRect.left + width + 10
        });
        $("#overlays-container").append(element);
        anime({
            targets : "." + targetClass,
            translateY : -50,
            opacity : 0,
            duration : 1000,
            easing : "linear",
            complete : (anim) => {
                element.remove();
            }
        });
    }

    static async enemyDeath() {
        await anime({
            targets : "#enemy-container",
            opacity : 0,
            duration : 400,
            easing : "linear"
        }).finished;
    }

    static async enemyReceiveDamage(damageTaken, type) {
        if (!currentEnemy) throw new Error("Cannot deal damage to nonexistant enemy!");
        Anim.enemyDamageNumber(damageTaken, type);
        
        let bgColor = "245, 146, 146";
        if (type == "poison") bgColor = "59, 194, 59";
        anime.set("#enemy-display", {
            backgroundColor : `rgba(${bgColor}, 0.501)`
        })
        await Promise.all([
            anime({
                targets : (type == "poison") ? null : "#enemy-display", // don't bounce on poison damage
                translateY : -15,
                direction : "alternate",
                duration : 100,
                easing : "easeOutQuad",
            }).finished,
            anime({
                targets : "#enemy-display",
                backgroundColor : `rgba(${bgColor}, 0)`,
                easing  : "easeOutQuad",
                duration : 300
            }).finished,
            Utils.sleep(500)
        ])
    }

    static playerReciveDamage(damageTaken) {
        let tc = "player-damage-number"
        let damageNumberContainer = $("<p>");
        damageNumberContainer.addClass(tc);
        damageNumberContainer.text("-" + damageTaken);
        Anim.playerHPNumberAnim(damageNumberContainer, tc);
        Anim.playerDamageFlash();
    }

    static async playerDamageFlash() {
        let damageFlashElement = $("<div>");
        damageFlashElement.addClass("damage-flash");

        $("#damage-flash-container").append(damageFlashElement);
        damageFlashElement.one("animationend", () => {
            damageFlashElement.remove();
        })
        damageFlashElement.addClass("damage-flash-active");
    }

    static playerHealDamage(heal) {
        let tc = "player-heal-number"
        let healNumberContainer = $("<p>");
        healNumberContainer.addClass(tc);
        healNumberContainer.text("+" + heal);
        Anim.playerHealDamage(healNumberContainer, tc)
    }

    static playerHPNumberAnim(element, targetClass) {
        let maxHPRect = $("#player-max-hp")[0].getBoundingClientRect();
        let width = $("#player-max-hp").width();
        let height = $("#player-max-hp").height();
        element.offset({
            top : maxHPRect.top - height,
            left : maxHPRect.left + width + 10
        });
        $("#overlays-container").append(element);

        anime({
            targets : "." + targetClass,
            translateX : 50,
            opacity : 0,
            duration : 1000,
            easing : "linear",
            complete : (anim) => {
                element.remove();
            }
        });
    }

    static playerChargeSpent(chargeSpent) {
        let tc = "player-charge-spent-number";
        let chargeSpentContainer = $("<p>");
        chargeSpentContainer.addClass(tc);
        chargeSpentContainer.text("-" + chargeSpent);
        Anim.playerChargeNumberAnim(chargeSpentContainer, tc);
    }

    static playerChargeGained(chargeGained) {
        let tc = "player-charge-gained-number";
        let chargeGainedContainer = $("<p>");
        chargeGainedContainer.addClass(tc);
        chargeGainedContainer.text("+" + chargeGained);
        Anim.playerChargeNumberAnim(chargeGainedContainer, tc)
    }

    static playerChargeNumberAnim(element, targetClass) {
        let maxChargeRect = $("#player-max-charge")[0].getBoundingClientRect();
        let width = $("#player-max-charge").width();
        let height = $("#player-max-charge").height();
        element.offset({
            top : maxChargeRect.top - height,
            left : maxChargeRect.left + width + 10
        });
        $("#overlays-container").append(element);

        anime({
            targets : "." + targetClass,
            translateX : 50,
            opacity : 0,
            duration : 1000,
            easing : "linear",
            complete : (anim) => {
                element.remove();
            }
        });
    }

    static async enemyAttack(attackCallback) {
        if (!currentEnemy) throw new Error("Cannot launch attack without an enemy!");

        let attackDone = false;

        await anime({
            targets : "#enemy-container",
            translateY : 30,
            direction : "alternate",
            duration : 120,
            easing : "easeOutQuad",
            changeComplete : (anim) => {
                if (!attackDone) {
                    attackCallback();
                    attackDone = true;
                }
            }
        }).finished;
        await Utils.sleep(400);
    }

    static async companionAttack(companion, attackCallback) {
        let companionTarget = `.companion-container[data-companion-id="${companion.id}"]`;

        let attackDone = false; 

        await anime({
            targets : companionTarget,
            translateX : -20,
            direction : "alternate",
            duration : 200,
            easing : "easeOutQuad",
            changeComplete : (anim) => {
                if (!attackDone) {
                    attackCallback();
                    attackDone = true;
                }
            }
        }).finished;
    }
}