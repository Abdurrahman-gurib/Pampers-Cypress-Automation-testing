/// <reference types="Cypress" />

const crmProperties = require('../../fixtures/testProperties/crm.properties.json');
const pampersMarketsUrlEnv = require('../../fixtures/testProperties/pampersUrls.properties.json');
const crmSelector = require('../../fixtures/cssSelector/pampersCrm.selectors.json');
const { getCrmMarketsScope } = require('../../support/utilities/utilities');

['fr-CA'].forEach((forgotPasswordScopeElement) => {
    describe(`Forgot Password for ${forgotPasswordScopeElement} on ${crmProperties.env}`, () => {
        before(() => {
            cy.clearCookies();
            cy.clearLocalStorage();
        });
        it(`open login page`,() => {
            const loginUrl = `${pampersMarketsUrlEnv[crmProperties.env][forgotPasswordScopeElement]}`
            + `/${crmProperties.login.properties[forgotPasswordScopeElement].localizedPath}`;
            cy.task(`systemLog`, `open ${loginUrl}`);
            cy.intercept(globalThis.params.appProperties.apiToWaitBeforeTest.method,
                globalThis.params.appProperties.apiToWaitBeforeTest.path).as("commonCss");
            cy.visit(encodeURI(loginUrl), {timeout: 60000});
            cy.wait("@commonCss", {timeout: 15000}).its('response.statusCode').should('eq', 200);
        });
        it(`click on forgot my password`,() => {
            cy.task(`systemLog`, `click on forgot my password to open the page`);
            cy.intercept(globalThis.params.appProperties.apiToWaitBeforeTest.method,
                globalThis.params.appProperties.apiToWaitBeforeTest.path).as("commonCss");
            cy.xpath(crmSelector.forgotPassword.forgotYourPassword).click({force: true});
            cy.wait("@commonCss", {timeout: 15000}).its('response.statusCode').should('eq', 200);
        });
        it(`complete email then submit form`,() => {
            cy.task(`systemLog`, `verify the reset password url, type email and send form`);
            cy.url().should(`include`, encodeURI(crmProperties.forgotPassword.properties[forgotPasswordScopeElement]));
            cy.get(crmSelector.login.email).type(crmProperties.login.properties[forgotPasswordScopeElement].login, {force: true});
            cy.get(crmSelector.forgotPassword.submitBtn).click({force: true});
        });
        it(`verify thank you page appears`,() => {
            cy.task(`systemLog`, `verify thank you page`);
            cy.get(crmSelector.forgotPassword.thankYouContainer, {timeout: 10000}).should(`be.visible`);
        });
    });
});