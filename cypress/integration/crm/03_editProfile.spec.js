/// <reference types="Cypress" />

const crmProperties = require('../../fixtures/testProperties/crm.properties.json');
const pampersMarketsUrlEnv = require('../../fixtures/testProperties/pampersUrls.properties.json');
const crmSelector = require('../../fixtures/cssSelector/pampersCrm.selectors.json');
const { generateRandomText } = require('../../support/utilities/utilities');
const { getCrmMarketsScope } = require('../../support/utilities/utilities');

(getCrmMarketsScope(crmProperties.editProfile)).forEach((editProfileScopeElement) => {
    const tempRandomText = generateRandomText();
    const localizedUrl = pampersMarketsUrlEnv[crmProperties.env][editProfileScopeElement];
    describe(`Edit Profile for ${editProfileScopeElement} on ${crmProperties.env}`, () => {
        it(`go to edit profile page`, () => {
            cy.task("systemLog", `open edit profile`);
            const tempUrl = `${localizedUrl}/${crmProperties.editProfile.properties[editProfileScopeElement]}`;
            cy.intercept(globalThis.params.appProperties.apiToWaitBeforeTest.method,
                globalThis.params.appProperties.apiToWaitBeforeTest.path).as("commonCssEditProfile");
            cy.visit(encodeURI(tempUrl), {timeout: 60000});
            cy.wait("@commonCssEditProfile", {timeout: 15000}).its('response.statusCode').should('eq', 200);
        });
        it(`edit last name`, () => { cy.editProfileLastName(crmSelector, tempRandomText, true, editProfileScopeElement); });
        it(`add child`, () => { cy.editProfileChild(crmSelector, tempRandomText, true); });
        it(`add new address`, () => { cy.editProfileAddress(crmSelector, tempRandomText, true); });
        it(`uncheck OptStatus`, () => { cy.editProfileOptStatus(crmSelector, true); });
        it(`save profile`, () => { cy.editProfileSave(crmSelector); });
        it(`verify that lastname has been updated`, () => { cy.editProfileLastName(crmSelector, tempRandomText, false, editProfileScopeElement); });
        it(`verify new address is present`, () => { cy.editProfileAddress(crmSelector, tempRandomText, false); });
        it(`verify new child has been added then remove it`, () => { cy.editProfileChild(crmSelector, tempRandomText, false); });
        it(`check OptStatus`, () => { cy.editProfileOptStatus(crmSelector, false); });
        it(`save Profile`, () => { cy.editProfileSave(crmSelector); });
    });
});

