/// <reference types="Cypress" />

const crmProperties = require('../../fixtures/testProperties/crm.properties.json');
const pampersMarketsUrlEnv = require('../../fixtures/testProperties/pampersUrls.properties.json');
const crmSelector = require('../../fixtures/cssSelector/pampersCrm.selectors.json');
const { getCrmMarketsScope } = require('../../support/utilities/utilities');

(getCrmMarketsScope(crmProperties.logout)).forEach((logoutScopeElement) => {
    describe(`Logout for ${logoutScopeElement} on ${crmProperties.env}`, () => {
        it(`Go to home page for ${logoutScopeElement}`, () => {
            const localizedUrl = `${pampersMarketsUrlEnv[crmProperties.env][logoutScopeElement]}`;
            cy.task("systemLog", `open url ${localizedUrl}`);
            cy.intercept(globalThis.params.appProperties.apiToWaitBeforeTest.method,
                globalThis.params.appProperties.apiToWaitBeforeTest.path).as("commonCss");
            cy.visit(encodeURI(localizedUrl), {timeout: 60000});
            cy.wait("@commonCss", {timeout: 15000}).its('response.statusCode').should('eq', 200);
        });
        it(`Click on avatar then logout button`, () => {
            const logoutProperties = Object.getOwnPropertyNames(crmProperties.logout.properties);
            let arraySelectors = [];
            arraySelectors = crmProperties.logout.properties[logoutProperties.includes(logoutScopeElement) ? logoutScopeElement : "common"];
            cy.task(`systemLog`, `logout for ${logoutScopeElement} using ${arraySelectors.join('-')}`);
            cy.logOut(crmSelector.logout[arraySelectors[0]], crmSelector.logout[arraySelectors[1]]);   
        });
    });
});