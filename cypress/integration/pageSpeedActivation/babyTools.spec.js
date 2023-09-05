/// <reference types="Cypress" />

const crmProperties = require('../../fixtures/testProperties/crm.properties.json');
const babyToolsProperties = require('../../fixtures/testProperties/babyTools.properties.json');
const babyToolsSelectors = require('../../fixtures/cssSelector/babyTools.selectors.json');
const { getMarketsScope } = require('../../support/utilities/utilities');

(getMarketsScope(babyToolsProperties, null)).forEach(scopeElement => {
    const tempMarketToTest = babyToolsProperties.markets[scopeElement];
    const tempMarketBaseUrl = globalThis.params.pampersUrls[babyToolsProperties.env][scopeElement];
    tempMarketToTest.babyTools.forEach(babyToolElement => {
        const tempBabyToolUrl = `${tempMarketBaseUrl}/${tempMarketToTest.localizedPath[babyToolElement]}`;
        describe(`[Pampers ${scopeElement}][Baby Tool][${babyToolElement}][Login]`, () => {
            before(() => {
                cy.clearCookies();
                cy.clearLocalStorage();
            });
            beforeEach(() => {
                cy.viewport(1920, 1080);
                cy.restoreLocalStorageCache();
                Cypress.Cookies.preserveOnce('accessTokens', 'remember_token');
            });
            afterEach(() => {
              cy.saveLocalStorageCache();
            });
            it(`[${babyToolElement}] Open Baby Tool Page`, () => {
                cy.task(`systemLog`, `Open Baby tool page ${tempBabyToolUrl}`);
                cy.intercept(globalThis.params.appProperties.apiToWaitBeforeTest.method,
                    globalThis.params.appProperties.apiToWaitBeforeTest.path).as("commonCss");
                cy.visit(tempBabyToolUrl, {timeout: 60000});
                cy.wait("@commonCss", {timeout: 15000}).its('response.statusCode').should('eq', 200);
            });
            babyToolsProperties.babyTools[babyToolElement].test.forEach(testStep => {
                const dontRunElement = babyToolsProperties.markets[scopeElement].dontRun; 
                if ((dontRunElement && dontRunElement[babyToolElement] && testStep.includes(dontRunElement[babyToolElement])) ? false : true) {
                    it(`[${babyToolElement}] ${testStep}`, () => {
                        cy.genericBabyToolAction(testStep, babyToolsSelectors, babyToolElement);
                    });
                }
            });
            it(`[${babyToolElement}] Login`, () => {
                cy.loginNoCommonJSToWait(null, crmProperties.login.properties[scopeElement].login, 
                    crmProperties.login.properties[scopeElement].password, null);
            });
            it(`verify access_token is present and user is not on home page`, () => {
                cy.task("systemLog", `verify access_token is present`);
                cy.wait(5000);
                cy.url().should(`not.eq`, tempMarketBaseUrl);
                cy.getCookie('accessTokens', {timeout: 10000}).should('exist');
            });
        });
        describe(`[Pampers ${scopeElement}][Baby Tool][${babyToolElement}][Registration]`, () => {
            before(() => {
                cy.clearCookies();
                cy.clearLocalStorage();
            });
            beforeEach(() => {
                cy.viewport(1920, 1080);
                cy.restoreLocalStorageCache();
                Cypress.Cookies.preserveOnce('accessTokens', 'remember_token');
            });
            afterEach(() => {
              cy.saveLocalStorageCache();
            });
            it(`[${babyToolElement}] Open Baby Tool Page`, () => {
                cy.task(`systemLog`, `Open Baby tool page ${tempBabyToolUrl}`);
                cy.intercept(globalThis.params.appProperties.apiToWaitBeforeTest.method,
                    globalThis.params.appProperties.apiToWaitBeforeTest.path).as("commonCss");
                cy.visit(tempBabyToolUrl, {timeout: 60000});
                cy.wait("@commonCss", {timeout: 15000}).its('response.statusCode').should('eq', 200);
            });
            babyToolsProperties.babyTools[babyToolElement].test.forEach(testStep => {
                const dontRunElement = babyToolsProperties.markets[scopeElement].dontRun; 
                if ((dontRunElement && dontRunElement[babyToolElement] && testStep.includes(dontRunElement[babyToolElement])) ? false : true) {
                    it(`[${babyToolElement}] ${testStep}`, () => {
                        cy.genericBabyToolAction(testStep, babyToolsSelectors, babyToolElement);
                    });
                }
            });
            it(`[${babyToolElement}] Registration`, () => {
                cy.genericRegistrationForm(crmProperties.registration.properties[scopeElement].fields, scopeElement);
            });
            it(`verify access_token is present and user is not on home page`, () => {
                cy.task("systemLog", `verify access_token is present`);
                cy.wait(5000);
                cy.url().should(`not.eq`, tempMarketBaseUrl);
                cy.getCookie('accessTokens', {timeout: 10000}).should('exist');
            });
        });
    });
});