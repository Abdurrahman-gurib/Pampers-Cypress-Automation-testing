/// <reference types="Cypress" />

const crmProperties = require('../../fixtures/testProperties/crm.properties.json');
const pampersMarketsUrlEnv = require('../../fixtures/testProperties/pampersUrls.properties.json');
const crmSelector = require('../../fixtures/cssSelector/pampersCrm.selectors.json');
const { generateRandomText } = require('../../support/utilities/utilities');
const { getCrmMarketsScope } = require('../../support/utilities/utilities');

['ro-RO'].forEach((editProfileScopeElement) => {
    const tempRandomTextForFirstName = `Name ${generateRandomText()}`;
    const tempRandomTextForChildName = `Child ${generateRandomText()}`;
    const tempRandomTextForAddress = `Address ${generateRandomText()}`;
    const localizedUrl = pampersMarketsUrlEnv[crmProperties.env][editProfileScopeElement];
    describe(`Edit Profile for ${editProfileScopeElement} on ${crmProperties.env}`, () => {
        // comment below since JANRAIN updated the number of connection per user
        // it(`open login page`, () => {
        //     const loginUrl = `${localizedUrl}/${crmProperties.login.properties[editProfileScopeElement].localizedPath}`;
        //     cy.task("systemLog", `test edit profile for ${editProfileScopeElement} on ${crmProperties.env}`);
        //     cy.intercept(globalThis.params.appProperties.apiToWaitBeforeTest.method,
        //         globalThis.params.appProperties.apiToWaitBeforeTest.path).as("commonCss");
        //     cy.task("systemLog", `open url ${loginUrl}`);
        //     cy.visit(encodeURI(loginUrl), {timeout: 60000});
        //     cy.wait("@commonCss", {timeout: 15000}).its('response.statusCode').should('eq', 200);
        // });
        // it(`log IN on pampers`, () => {
        //     cy.task("systemLog", `type email and password`);
        //     cy.get(crmSelector.login.email, {timeout: 5000}).type(crmProperties.login.properties[editProfileScopeElement].login, {force: true});
        //     cy.get(crmSelector.login.password).type(crmProperties.login.properties[editProfileScopeElement].password, {force: true});
        //     cy.get(crmSelector.login.submitLoginFormBtn).click({force: true});
        //     if (editProfileScopeElement.includes(`-BE`)){
        //         cy.get(`.language-selector-page`, {timeout: 15000}).should('be.visible');
        //     } else {
        //         cy.get(crmSelector.login.nav, {timeout: 10000}).should('be.visible');
        //     }
        //     cy.getCookie('accessTokens').should('exist');
        //     cy.saveLocalStorageCache();
        // });
        it(`go to edit profile page`, () => {
            cy.task("systemLog", `open edit profile`);
            const tempUrl = `${localizedUrl}/${crmProperties.editProfile.properties[editProfileScopeElement]}`;
            cy.intercept(globalThis.params.appProperties.apiToWaitBeforeTest.method,
                globalThis.params.appProperties.apiToWaitBeforeTest.path).as("commonCssEditProfile");
            cy.visit(encodeURI(tempUrl), {timeout: 60000});
            cy.wait("@commonCssEditProfile", {timeout: 15000}).its('response.statusCode').should('eq', 200);
        });
        it(`edit last name`, () => { cy.editProfileLastName(crmSelector, tempRandomTextForFirstName, true); });
        it(`add child`, () => { cy.editProfileChild(crmSelector, tempRandomTextForChildName, true); });
        it(`add new address`, () => { cy.editProfileAddress(crmSelector, tempRandomTextForAddress, true); });
        it(`uncheck OptStatus`, () => { cy.editProfileOptStatus(crmSelector, true); });
        it(`save profile`, () => { cy.editProfileSave(crmSelector); });
        it(`verify that lastname has been updated`, () => { cy.editProfileLastName(crmSelector, tempRandomTextForFirstName, false); });
        it(`verify new address is present`, () => { cy.editProfileAddress(crmSelector, tempRandomTextForAddress, false); });
        it(`verify new child has been added then remove it`, () => { cy.editProfileChild(crmSelector, tempRandomTextForChildName, false); });
        it(`check OptStatus`, () => { cy.editProfileOptStatus(crmSelector, false); });
        it(`save Profile`, () => { cy.editProfileSave(crmSelector); });
        // it(`Back to home page then perform a log out`, () => {
        //     cy.task(`systemLog`, `go to ${localizedUrl} then log out`);
        //     cy.visit(encodeURI(localizedUrl), {timeout: 60000});
        //     cy.logOut();
        // });
    });
});

