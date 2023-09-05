/// <reference types="Cypress" />

// we use only 1 spec for all markets.
const embeddedToolProperties = require('../../fixtures/cssSelector/embeddedToolActivation.selectors.json');
const embeddedToolList = Object.getOwnPropertyNames(embeddedToolProperties.cssSelector);

(embeddedToolProperties.test).forEach((marketElement) => {
    const marketScope = embeddedToolProperties.scope[marketElement];
    const testCaseList = Object.getOwnPropertyNames(marketScope.data);
    testCaseList.forEach((testCaseElement) => {
        describe(`[Embedded Tool Activation][${marketElement} - ${testCaseElement}]`, () => {
            marketScope.data[testCaseElement].forEach((testStepElement) => {
                before(() => {
                    cy.clearCookies();
                    cy.clearLocalStorage();
                });
                it(testStepElement, () => {
                    const buildUrl = marketScope.baseUrl + testStepElement;
                    cy.viewport(1920, 1080);
                    cy.task("systemLog", `Embedded Tool Activation ${marketElement} | ${testCaseElement} | ${buildUrl}`);
                    cy.openUrl(buildUrl);
                    if (embeddedToolProperties.cssSelector[testCaseElement]) {
                        // lazy load -_-
                        cy.get(`.copyright__img`, {timeout: 5000}).scrollIntoView({ easing: 'linear', duration: 5500, force: true });
                        cy.wait(5500);
                        cy.get(`.container.breadcrumb-container`).scrollIntoView({ easing: 'linear', duration: 5500, force: true });
                        cy.wait(2500);
                        cy.task(`systemLog`, `Only ${testCaseElement} should be visible`);
                        embeddedToolList.forEach((embeddedToolCssSelectorNameElement) => {
                            if (testCaseElement === embeddedToolCssSelectorNameElement) {
                                cy.task(`systemLog`, `Verify if ${testCaseElement} is present`);
                                cy.get(embeddedToolProperties.cssSelector[testCaseElement], {timeout: 15000}).should("be.visible");
                            } else {
                                cy.task(`systemLog`, `Verify if ${embeddedToolCssSelectorNameElement} is not present`);
                                cy.get(embeddedToolProperties.cssSelector[embeddedToolCssSelectorNameElement], {timeout: 5000}).should('not.exist');
                            }
                        });
                    } else {
                        cy.task(`systemLog`, `No CSS Selector provided for ${testCaseElement}`);
                    }
                });
            });
        });
    });
});