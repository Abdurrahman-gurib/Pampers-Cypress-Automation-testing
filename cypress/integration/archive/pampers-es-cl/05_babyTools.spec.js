/// <reference types="Cypress" />

const babyToolsProperties = require('../../fixtures/testProperties/babyTools.properties.json');
const babyToolsSelectors = require('../../fixtures/cssSelector/babyTools.selectors.json');
const { getMarketsScope } = require('../../support/utilities/utilities');

['es-CL'].forEach(scopeElement => {
    const tempMarketToTest = babyToolsProperties.markets[scopeElement];
    const tempMarketBaseUrl = globalThis.params.pampersUrls[babyToolsProperties.env][scopeElement];
    tempMarketToTest.babyTools.forEach(babyToolElement => {
        const tempBabyToolUrl = `${tempMarketBaseUrl}/${tempMarketToTest.localizedPath[babyToolElement]}`;
        describe(`[Pampers ${scopeElement}][Baby Tool][${babyToolElement}]`, () => {
            if (!tempMarketToTest.loggedUser) {
                before(() => {
                    cy.clearCookies();
                    cy.clearLocalStorage();
                });
                beforeEach(() => {
                    cy.restoreLocalStorageCache();
                    Cypress.Cookies.preserveOnce('accessTokens', 'remember_token');
                });
            }
            afterEach(() => { cy.saveLocalStorageCache(); });
            it(`[${babyToolElement}] Open Baby Tool Page`, () => {
                cy.task(`systemLog`, `Open Baby tool page ${tempBabyToolUrl}`);
                cy.intercept(globalThis.params.appProperties.apiToWaitBeforeTest.method,
                    globalThis.params.appProperties.apiToWaitBeforeTest.path).as("commonCss");
                cy.visit(encodeURI(tempBabyToolUrl), {timeout: 60000});
                cy.wait("@commonCss", {timeout: 15000}).its('response.statusCode').should('eq', 200);
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
            if (!tempMarketToTest.loggedUser) {
                it(`[${babyToolElement}] verify noindex is present in registration page`, () => {
                    cy.wait(5000);
                    cy.checkMetaAttributeContains(`noindex`, true);
                });
                it(`[${babyToolElement}] Login`, () => {
                    let crmProperties = require('../../fixtures/testProperties/crm.properties.json');
                    let login = crmProperties.login.properties[scopeElement].login || "pampersqa@gmail.com";
                    let password = crmProperties.login.properties[scopeElement].password || "Testing123";
                    cy.loginNoCommonJSToWait(null, login, password, null);
                    crmProperties = null; login = null; password = null;
                });
            }
            if (babyToolsProperties.babyTools[babyToolElement].result.length) {
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
    });
});