/// <reference types="Cypress" />

const crmProperties = require('../../fixtures/testProperties/crm.properties.json');
const pampersMarketsUrlEnv = require('../../fixtures/testProperties/pampersUrls.properties.json');
const crmSelector = require('../../fixtures/cssSelector/pampersCrm.selectors.json');
const { getCrmMarketsScope } = require('../../support/utilities/utilities');

['fr-BE'].forEach((loginScopeElement) => {
    describe(`Login for ${loginScopeElement} on ${crmProperties.env}`, () => {
        before(() => {
            cy.clearCookies();
            cy.clearLocalStorage();
        });
        it(`open login page`, () => {
            const localizedUrl = `${pampersMarketsUrlEnv[crmProperties.env][loginScopeElement]}`
                + `/${crmProperties.login.properties[loginScopeElement].localizedPath}`;
            cy.task("systemLog", `login test for ${loginScopeElement} on ${crmProperties.env}`);
            cy.intercept(globalThis.params.appProperties.apiToWaitBeforeTest.method,
                globalThis.params.appProperties.apiToWaitBeforeTest.path).as("commonCss");
            cy.task("systemLog", `open url ${localizedUrl}`);
            cy.visit(encodeURI(localizedUrl), {timeout: 60000});
            cy.wait("@commonCss", {timeout: 15000}).its('response.statusCode').should('eq', 200);
        });
        it(`type email address`, () => {
            cy.task("systemLog", `type email address`);
            cy.get(crmSelector.login.email, {timeout: 5000}).type(crmProperties.login.properties[loginScopeElement].login, {force: true});
        });
        it(`type password`, () => {
            cy.task("systemLog", `type password`);
            cy.get(crmSelector.login.password).type(crmProperties.login.properties[loginScopeElement].password, {force: true});
        });
        it(`submit form`, () => {
            cy.task("systemLog", `click on login`);
            cy.get(crmSelector.login.submitLoginFormBtn).click({force: true});
        });
        it(`verify user is logged IN`, () => {
            cy.task("systemLog", `verify user is logged IN`);
            if (loginScopeElement.includes(`-BE`)){
                cy.get(`.language-selector-page`, {timeout: 15000}).should('be.visible');
            } else {
                // back to home page, navigation menu should be visible
                cy.get(crmSelector.login.nav, {timeout: 10000}).should('be.visible');
                // keep it here to avoid any redirection issue like on canary
                cy.url().should('include', pampersMarketsUrlEnv[crmProperties.env][loginScopeElement]);
            }
            cy.getCookie('accessTokens').should('exist');
            cy.saveLocalStorageCache();
        });
    });
});