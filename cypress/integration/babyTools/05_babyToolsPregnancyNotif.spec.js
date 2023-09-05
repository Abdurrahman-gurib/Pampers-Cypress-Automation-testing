/// <reference types="Cypress" />

const babyToolsProperties = require('../../fixtures/testProperties/babyTools.properties.json');
const babyToolsSelectors = require('../../fixtures/cssSelector/babyTools.selectors.json');
const { getMarketsScope } = require('../../support/utilities/utilities');

const scopeElement = "en-US";
const tempMarketToTest = babyToolsProperties.markets[scopeElement];
const tempMarketBaseUrl = globalThis.params.pampersUrls[babyToolsProperties.env][scopeElement];

const babyToolElement = "pregnancyNotifier";
const tempBabyToolUrl = `${tempMarketBaseUrl}/${tempMarketToTest.localizedPath[babyToolElement]}`;

describe(`[Pampers ${scopeElement}][Baby Tool][${babyToolElement}]`, () => {
    it(`[${babyToolElement}] Open Baby Tool Page`, () => {
        cy.clearCookie(`accessTokens`).then(() => {
            cy.task(`systemLog`, `Open Baby tool page ${tempBabyToolUrl}`);
            cy.intercept(globalThis.params.appProperties.apiToWaitBeforeTest.method,
                globalThis.params.appProperties.apiToWaitBeforeTest.path).as("commonCss");
            cy.visit(encodeURI(tempBabyToolUrl), {timeout: 60000});
            cy.wait("@commonCss", {timeout: 15000}).its('response.statusCode').should('eq', 200);
        });
    });
    babyToolsProperties.babyTools[babyToolElement].test.forEach(testStep => {
        const dontRunElement = babyToolsProperties.markets[scopeElement].dontRun; 
        if ((dontRunElement && dontRunElement[babyToolElement] && testStep.includes(dontRunElement[babyToolElement])) ? false : true) {
            it(`[${babyToolElement}] ${testStep}`, () => {
                if (tempMarketToTest.loggedUser && babyToolElement === `BNG` && testStep === "ctaBtn") {
                    cy.task(`systemLog`, `skip test for BNG Cta`);
                } else { cy.genericBabyToolAction(testStep, babyToolsSelectors, babyToolElement); }
            });
        }
    });
    // ---START---
    // REG new user for this one only
    it(`[${babyToolElement}] verify noindex is present in registration page`, () => {
        cy.wait(5000);
        cy.checkMetaAttributeContains(`noindex`, true);
    });
    it(`[${babyToolElement}] Registration`, () => {
        const crmProperties = require('../../fixtures/testProperties/crm.properties.json');
        const crmSelector = require('../../fixtures/cssSelector/pampersCrm.selectors.json');
        cy.task(`systemLog`, `Complete registraiton form for ${scopeElement}`
            + ` with "${crmProperties.registration.properties[scopeElement].fields.join("/")}"`);
        cy.genericRegistrationForm(crmProperties.registration.properties[scopeElement].fields, scopeElement, {"dontCheckLoaderAndClickAgain": true});
        cy.get(crmSelector.registration.thankYouElement, {timeout: 15000}).should('exist');
        cy.getCookie('accessTokens').should('exist');
        // add redirect URL for post REG
        cy.window().then((window) => {
            window.localStorage.setItem(`previousPageUrl`, tempBabyToolUrl.split(tempBabyToolUrl.split("/")[2])[1]);
        });
        // ------
        cy.saveLocalStorageCache();
        cy.get(crmSelector.registration.thankYouElement).click();
    });
    // ---END---
    // ---------
    if (babyToolsProperties.babyTools[babyToolElement].result.length) {
        // start flow post REG
        babyToolsProperties.babyTools[babyToolElement].result.forEach(testStep => {
            const dontRunElement = babyToolsProperties.markets[scopeElement].dontRun;
            if ((dontRunElement && dontRunElement[babyToolElement] && testStep.includes(dontRunElement[babyToolElement])) ? false : true) {
                it(`[${babyToolElement}] ${testStep}`, () => {
                    cy.genericBabyToolAction(testStep, babyToolsSelectors, babyToolElement);
                });
            }
        });
    }
});