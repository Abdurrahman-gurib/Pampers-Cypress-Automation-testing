Cypress.Commands.add("openUrl", (baseUrl, argTimeOut) => {
    cy.task(`systemLog`, `Open url ${baseUrl}`);
    cy.intercept(globalThis.params.appProperties.apiToWaitBeforeTest.method,
       globalThis.params.appProperties.apiToWaitBeforeTest.path).as("commonCss");
    cy.viewport(1920,1080);
    cy.visit(baseUrl);
    cy.wait("@commonCss", {timeout: argTimeOut || 20000}).its('response.statusCode').should('eq', 200);
});

Cypress.Commands.add("verifyMobileMenuOrDesktopFooter", (platform) => {
    cy.log(`verify mobile menu or desktop footer`);
    if (platform == "mobile") {
        cy.get('.mobile-menu__button').click();
        cy.get('.profile__container button').click();
    } else {
        cy.get('footer', { timeout: 1500 }).should('exist');
        cy.wait(7000);
        cy.intercept(globalThis.params.appProperties.apiToWaitBeforeTest.method,
            globalThis.params.appProperties.apiToWaitBeforeTest.path).as("commonCss");
        cy.get("button.item---link.text-login.event_profile_register").click({force: true});
        cy.wait("@commonCss", {timeout: 20000}).its('response.statusCode').should('eq', 200);
    }
});

Cypress.Commands.add(`genericClickOrType`, (argSelector) => {
    // it's just click or types for now.
    cy.task(`systemLog`, `Generate action for ${argSelector}`);
    if (argSelector.includes(`//`)) {
        if (argSelector.includes(`|`)) {
            cy.xpath(argSelector.split('|')[0]).type(argSelector.split(`|`)[1], {force: true});
        } else {
            cy.xpath(argSelector).click({force: true});
        }
    } else {
        if (argSelector.includes(`|`)) {
            cy.get(argSelector.split('|')[0]).type(argSelector.split(`|`)[1], {force: true});
        } else {
            cy.get(argSelector).click({force: true});
        }
    }
});

Cypress.Commands.add(`genericBabyToolAction`, (argTestStep, argBabyToolsSelectors, argBabyToolElement) => {
    const testStep = argTestStep.includes(`%`) ? argTestStep.split(`%`)[1] : argTestStep;
    cy.task(`systemLog`, `generic Baby Tool Action ${testStep}`);
    switch (testStep) {
        case "wait":
            cy.wait(2500);
            break;
        case "saveTemp" :
            const tempSelector = argBabyToolsSelectors[argBabyToolElement][argTestStep.split(`%`)[0]];
            cy.task(`systemLog`, `save temp value from ${tempSelector}`);
            cy[tempSelector.includes(`//`) ? `xpath` : `get`](tempSelector).then(($value) => {
                cy.wait(1500);
                globalThis.params.garbage.babyTools = $value.text();
                cy.task(`systemLog`, `babyTools garbage ${globalThis.params.garbage.babyTools}`);
            });
            break;
        case "typeTemp" :
            cy.genericClickOrType(`${argBabyToolsSelectors[argBabyToolElement][argTestStep.split(`%`)[0]]}|${globalThis.params.garbage.babyTools}`);
            break;
        case "rmTemp" :
            globalThis.params.garbage.babyTools = null;
            break;
        default :
            const tempStepSelector = testStep.split(`|`);
            const tempGenericClickOrTypeArg = tempStepSelector[1] ? `|${tempStepSelector[1]}` : ``;
            tempStepSelector[0].includes("isVisible_")
                ? cy[(argBabyToolsSelectors[argBabyToolElement][tempStepSelector[0].split(`_`)[1]]).includes(`//`) ? `xpath` : `get`](argBabyToolsSelectors[argBabyToolElement][tempStepSelector[0].split(`_`)[1]]).should(`be.visible`)
                : cy.genericClickOrType(argBabyToolsSelectors.common[tempStepSelector[0]]
                    ? `${argBabyToolsSelectors.common[tempStepSelector[0]]}${tempGenericClickOrTypeArg}`
                    : `${argBabyToolsSelectors[argBabyToolElement][tempStepSelector[0]]}${tempGenericClickOrTypeArg}`);
            break;
    }
});

Cypress.Commands.add(`checkMetaAttributeContains`, (argAttribute, argPresent) => {
    cy.task(`systemLog`, `check if meta attribute contains ${argAttribute} is ${argPresent}`);
    cy.get(`meta`).then((htmlObj) => {
        const meta = htmlObj;
        let pass = null;
        for (let tempId = 0; tempId < meta.length; tempId++) {
            const outerHtml = meta[tempId].outerHTML;
            if (argPresent) {
                cy.task(`systemLog`, `check if ${argAttribute} is present in ${outerHtml}`);
                if (outerHtml.includes(argAttribute)) {
                    pass = true;
                    break; 
                } else { pass = false; }
            } else {
                cy.task(`systemLog`, `check if ${argAttribute} is not be present in ${outerHtml}`);
                if (outerHtml.includes(argAttribute)) {
                    pass = false;
                    break;
                }else { pass = true; }
            }
        }
        if (!pass) {
            throw new Error (`ERR! expected to ${argPresent? 'found' : 'not found'} ${argAttribute} in meta tag`);
        }
    });
});