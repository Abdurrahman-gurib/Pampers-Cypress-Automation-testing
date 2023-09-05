/// <reference types="Cypress" />

const crmSelector = require('../../fixtures/cssSelector/pampersCrm.selectors.json');
const properties = require(`../../fixtures/testProperties/taxonomy.vortex.properties.json`);
const jsonExcel = [];

(Object.getOwnPropertyNames(properties.scope)).forEach(vortexElement => {
    const tempObj = properties.scope[vortexElement];
    // loop each feature
    describe (`Taxonomy Vortex - ${vortexElement}`, () => {
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
        // open pre-registration page
        it (`Pre-registration page`, () => {
            cy.openTaxoBl(vortexElement, tempObj.url);
            // one-off... so let's use wait here
            cy.wait(10000);
            // tac tac tac
            // action here!
            tempObj.action.forEach(actionElement => {
                cy.genericClickOrType(actionElement);
            });
        });
        // once on registration
        // save data-action-detail
        // then complete registration
        it (`Registration page`, () => {
            cy.task("systemLog", `dad + registration`);
            cy.wait(15000);
            // save dad
            cy.getDADJsonExcel(`vortex ${vortexElement} registration page`, properties.common.registrationSelector, properties.common.staticLabel, (res) => {
                cy.task("systemLog", `generate Taxonomy json file vortex registration page`);
                jsonExcel.push.apply(jsonExcel, res);
                cy.writeFile(`cypress/results/taxonomy/taxonomy_vortex.json`, jsonExcel);
            });
            // then complete registration
            cy.genericRegistrationForm([""], { timeout: 1000 });
            cy.wait(12500);
        });
        it (`Post-registration page`, () => {
            cy.task("systemLog", `post registration for dad as logged user`);
            cy.getDADJsonExcel(`vortex ${vortexElement} logged user`, tempObj.postRegistrationSelector, tempObj.staticLabel, (res) => {
                cy.task("systemLog", `generate Taxonomy json file vortex registration page`);
                jsonExcel.push.apply(jsonExcel, res);
                cy.writeFile(`cypress/results/taxonomy/taxonomy_vortex.json`, jsonExcel);
            });
        });
        // complete under age flow
        it (`delete user - under age`, () => {
            cy.task("systemLog", `underage flow`);
            cy.visit(`https://www.pampers.com/en-us/edit-profile`, {timeout: 60000});
            cy.wait(15000);
            const aboutYouCalendar = (crmSelector.editProfile.aboutYouSection).split(" h2")[0] + " " + crmSelector.registration.reactCalendarIcon;
            cy.get(crmSelector.editProfile.aboutYouSection).click({force: true});
            cy.get(aboutYouCalendar, {timeout: 5000}).click({force: true});
            cy.xpath(crmSelector.registration.selectDateInReactCalendar, {timeout: 5000}).click().then(() => {
                cy.wait(1000);
                cy.get(crmSelector.editProfile.aboutYouYearField).type("2022");
                cy.get(crmSelector.editProfile.saveBtn, {timeout: 1500}).click();
                cy.get(crmSelector.editProfile.ineligible, {timeout: 15000}).should(`be.visible`);
            });
        });
    });
});