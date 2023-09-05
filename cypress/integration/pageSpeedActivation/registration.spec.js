/// <reference types="Cypress" />

const crmProperties = require('../../fixtures/testProperties/crm.properties.json');
const pampersMarketsUrlEnv = require('../../fixtures/testProperties/pampersUrls.properties.json');
const crmSelector = require('../../fixtures/cssSelector/pampersCrm.selectors.json');
const { getCrmMarketsScope } = require('../../support/utilities/utilities');

(getCrmMarketsScope(crmProperties.registration)).forEach((registrationScopeElement) => {
    const localizedUrl = `${pampersMarketsUrlEnv[crmProperties.env][registrationScopeElement]}`;
    describe(`Registration for ${registrationScopeElement} on ${crmProperties.env}`, () => {
        before(() => {
            cy.clearCookies();
            cy.clearLocalStorage();
        });
        beforeEach(() => {
            cy.viewport(1920, 1080);
            cy.restoreLocalStorageCache();
            Cypress.Cookies.preserveOnce('accessTokens', 'remember_token');
        });
        it(`open home page`, () => {
            cy.task("systemLog", `registration test for ${registrationScopeElement} on ${crmProperties.env}`);
            cy.task("systemLog", `open url ${localizedUrl}`);
            cy.intercept(globalThis.params.appProperties.apiToWaitBeforeTest.method,
                globalThis.params.appProperties.apiToWaitBeforeTest.path).as("commonCssHomepage");
            cy.visit(localizedUrl, {timeout: 60000});
            cy.wait("@commonCssHomepage", {timeout: 15000}).its('response.statusCode').should('eq', 200);
        });
        it(`go to registration page`, () => {
            cy.wait(2500);
            cy.intercept(globalThis.params.appProperties.apiToWaitBeforeTest.method,
                globalThis.params.appProperties.apiToWaitBeforeTest.path).as("commonCssRegistrationPage");
            cy.get(crmSelector.registration.registrationNavigationMenu, {timeout: 5000}).click({force: true});
            cy.wait("@commonCssRegistrationPage", {timeout: 15000}).its('response.statusCode').should('eq', 200);
        });
        it(`verify registration url is localized`, () => {
            cy.task(`systemLog`, `verify registration url is localized ${crmProperties.registration.properties[registrationScopeElement].localizedPath.registration}`);
            cy.url().should('include', crmProperties.registration.properties[registrationScopeElement].localizedPath.registration);
        });
        it(`complete registration form`, () => {
            cy.task(`systemLog`, `Complete registraiton form for ${registrationScopeElement}`
                + ` with "${crmProperties.registration.properties[registrationScopeElement].fields.join("/")}"`);
            cy.genericRegistrationForm(crmProperties.registration.properties[registrationScopeElement].fields, registrationScopeElement);
        });
        it(`verify thank you page`, () => {
            cy.task("systemLog", `verify thank you page and access_token`);
            cy.get(crmSelector.registration.thankYouElement, {timeout: 10000}).should('exist');
            cy.saveLocalStorageCache();
        });
        it(`verify access_token is present`, () => {
            cy.task("systemLog", `verify access_token is present when open home page`);
            cy.visit(localizedUrl, {timeout: 60000});
            cy.getCookie('accessTokens', {timeout: 10000}).should('exist');
        });
    });
});