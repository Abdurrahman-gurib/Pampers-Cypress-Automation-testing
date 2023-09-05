/// <reference types="Cypress" />

const taxonomyProperties = require('../../fixtures/testProperties/taxonomy.cgp.properties.json');
const scope = Object.getOwnPropertyNames(taxonomyProperties.scope);
const { generateDateForCalendar } = require('../../support/utilities/utilities');
const jsonExcel = [];

scope.forEach(scopeElement => {
    describe(`[Taxonomy][${scopeElement}]`, () => {
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
        it(`[taxonomy][${scopeElement}][User not logged]`, () => {
            cy.openTaxoBl(scopeElement, taxonomyProperties.scope[scopeElement].url);
            // scan and get data-action-detail
            cy.getDADJsonExcel(`${scopeElement} User not logged`, taxonomyProperties.scope[scopeElement].selector, taxonomyProperties.staticLabel, (res) => {
                cy.task("systemLog", `generate Taxonomy json file ${JSON.stringify(res)}`);
                jsonExcel.push.apply(jsonExcel, res);
                cy.writeFile(`cypress/results/taxonomy/taxonomy_cgp_${taxonomyProperties.market}.json`, jsonExcel);
            });
            // complete cgp flow
            // if not embedded wait 5s for cal js 
            if (!scopeElement.includes(`embedded`)) {
                cy.wait(5000);
            }
            cy.xpath(taxonomyProperties.flow.calendarIcon).click({force: true});
            cy.xpath(generateDateForCalendar(), { timeout: 10000 }).click({force: true});
            cy.xpath(taxonomyProperties.flow.momAge).type(`25`, {force: true});
            cy.xpath(taxonomyProperties.flow.cta).click({force: true});
        });
        it(`[taxonomy][${scopeElement}][registration]`, () => {
            cy.task("systemLog", `Taxonomy ${scopeElement} registration`);
            cy.get(taxonomyProperties.container.registration, {timeout: 15000}).should("be.visible");
            cy.getDADJsonExcel(`${scopeElement} registration`, taxonomyProperties.container.registration, taxonomyProperties.staticLabel, (res) => {
                cy.task("systemLog", `generate Taxonomy json file ${JSON.stringify(res)}`);
                jsonExcel.push.apply(jsonExcel, res);
                cy.writeFile(`cypress/results/taxonomy/taxonomy_cgp_${taxonomyProperties.market}.json`, jsonExcel);
            });
            cy.wait(7500);
            const crmProperties = require('../../fixtures/testProperties/crm.properties.json');
            cy.genericRegistrationForm(crmProperties.registration.properties[taxonomyProperties.market].fields, taxonomyProperties.market);
        });
        if (!scopeElement.includes(`embedded`)) {
            it(`[taxonomy][${scopeElement}][result page]`, () => {
                cy.task("systemLog", `Taxonomy ${scopeElement} result page`);
                cy.get(taxonomyProperties.container.result, {timeout: 15000}).should("be.visible");
                cy.getDADJsonExcel(`${scopeElement} result page`, taxonomyProperties.container.result, taxonomyProperties.staticLabel, (res) => {
                    cy.task("systemLog", `generate Taxonomy json file ${JSON.stringify(res)}`);
                    jsonExcel.push.apply(jsonExcel, res);
                    cy.writeFile(`cypress/results/taxonomy/taxonomy_cgp_${taxonomyProperties.market}.json`, jsonExcel);
                });
            });
            it(`[taxonomy][${scopeElement}][User logged in]`, () => {
                // if (scopeElement.includes(`embedded`)) {
                //     cy.get(taxonomyProperties.scope[scopeElement].successMessage, {timeout: 15000}).should("be.visible");
                //     // clear localstorage value for chineseGenderPrediction
                //     cy.clearLocalStorage(`chineseGenderPrediction`);
                // }
                cy.task("systemLog", `Taxonomy ${scopeElement} User logged in`);
                cy.openTaxoBl(scopeElement, taxonomyProperties.scope[scopeElement].url);
                cy.getDADJsonExcel(`${scopeElement} User logged in`, taxonomyProperties.scope[scopeElement].selector, taxonomyProperties.staticLabel, (res) => {
                    cy.task("systemLog", `generate Taxonomy json file ${JSON.stringify(res)}`);
                    jsonExcel.push.apply(jsonExcel, res);
                    cy.writeFile(`cypress/results/taxonomy/taxonomy_cgp_${taxonomyProperties.market}.json`, jsonExcel);
                });
            });
        }
    });
});