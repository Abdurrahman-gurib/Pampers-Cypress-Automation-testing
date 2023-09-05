/// <reference types="Cypress" />

const crmProperties = require('../../fixtures/testProperties/crm.properties.json');
const pampersMarketsUrlEnv = require('../../fixtures/testProperties/pampersUrls.properties.json');
const crmSelector = require('../../fixtures/cssSelector/pampersCrm.selectors.json');
const { getCrmMarketsScope, generateDateForCalendar } = require('../../support/utilities/utilities');

['uk-UA'].forEach((registrationScopeElement) => {
    const localizedUrl = `${pampersMarketsUrlEnv[crmProperties.env][registrationScopeElement]}`;
    describe(`Registration for ${registrationScopeElement} on ${crmProperties.env}`, () => {
        before(() => {
            cy.clearCookies();
            cy.clearLocalStorage();
        });
        beforeEach(() => {
            cy.restoreLocalStorageCache();
            Cypress.Cookies.preserveOnce('accessTokens', 'remember_token');
        });
        it(`open home page`, () => {
            cy.task("systemLog", `registration test for ${registrationScopeElement} on ${crmProperties.env}`);
            cy.task("systemLog", `open url ${localizedUrl}`);
            cy.intercept(globalThis.params.appProperties.apiToWaitBeforeTest.method,
                globalThis.params.appProperties.apiToWaitBeforeTest.path).as("commonCssHomepage");
            cy.visit(encodeURI(localizedUrl), {timeout: 60000});
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
            cy.url().should('include', encodeURI(crmProperties.registration.properties[registrationScopeElement].localizedPath.registration));
        });
        it(`verify noindex is not present`, () => {
            cy.checkMetaAttributeContains(`noindex`, false);
        });
        it(`complete registration form`, () => {
            cy.task(`systemLog`, `Complete registraiton form for ${registrationScopeElement}`
                + ` with "${crmProperties.registration.properties[registrationScopeElement].fields.join("/")}"`);
            cy.genericRegistrationForm(crmProperties.registration.properties[registrationScopeElement].fields, registrationScopeElement);
        });
        it(`verify thank you page`, () => {
            cy.task("systemLog", `verify thank you page and access_token`);
            cy.get(crmSelector.registration.thankYouElement, {timeout: 15000}).should('exist');
            cy.url().should('include', encodeURI(crmProperties.registration.properties[registrationScopeElement].localizedPath.thankYou));
            cy.saveLocalStorageCache();
        });
        if (registrationScopeElement !== "de-DE") {
            it(`verify access_token is present`, () => {
                cy.task("systemLog", `verify access_token is present when open home page`);
                cy.visit(encodeURI(localizedUrl), {timeout: 60000});
                cy.getCookie('accessTokens', {timeout: 10000}).should('exist');
            });
            it(`open edit profile`, () => {
                cy.task("systemLog", `open edit profile`);
                const tempUrl = `${localizedUrl}/${crmProperties.registration.properties[registrationScopeElement].localizedPath.editProfile}`;
                cy.intercept(globalThis.params.appProperties.apiToWaitBeforeTest.method,
                    globalThis.params.appProperties.apiToWaitBeforeTest.path).as("commonCssEditProfile");
                cy.visit(encodeURI(tempUrl), {timeout: 60000});
                cy.wait("@commonCssEditProfile", {timeout: 15000}).its('response.statusCode').should('eq', 200);
            });
            it(`verify login used for registration`, () => {
                cy.task("systemLog", `verify login info`);
                cy.get(crmSelector.editProfile.loginAndPasswordSection, {timeout: 7500}).click({force: true});
                cy.wait(2500);
                cy.get(crmSelector.editProfile.email, {timeout: 5000}).should("have.attr", "value")
                    .and("include", globalThis.params.garbage.tempEmailAddress);
            });
            if (!crmProperties.registration.properties[registrationScopeElement].fields.includes("noFirstName")) {
                it(`verify personal information`, () => {
                    cy.task("systemLog", `verify firstname`);
                    cy.get(crmSelector.editProfile.aboutYouSection).click({force: true});
                    cy.get(crmSelector.registration.firstName, {timeout: 1500}).should("have.value", crmSelector.properties.firstName);
                });
            }
            if (crmProperties.registration.properties[registrationScopeElement].fields.includes("phoneNumber")) {
                it(`verify phone number is present`, () => {
                    cy.task("systemLog", `verify firstname`);
                    cy.get(crmSelector.editProfile.yourAddressSection, {timeout: 7500}).click({force: true});
                    cy.wait(2500);
                    cy.get(crmSelector.editProfile.phoneNumber, {timeout: 5500}).should(`exist`);
                    // cy.get(crmSelector.editProfile.phoneNumber, {timeout: 5500}).should("have.attr", "value")
                    //     .and("include", globalThis.params.garbage.tempPhoneNumber);
                });
            }
            if (crmProperties.registration.properties[registrationScopeElement].fields.includes("gdpr")) {
                // check no baby in edit profile
                it (`verify no baby in edit profile for gdpr not parent`, () => {
                    cy.gdprEditProfileNoBaby();
                });
            }
            if (registrationScopeElement != "he-IL" && registrationScopeElement != "ar-SA") {
                it(`verify no issue if user click on cancel before save change`, () => {
                    cy.postRegCheckCancelAndSaveProfile(crmSelector.editProfile);
                });
            }
        }
        if (registrationScopeElement === "en-US") {
            it(`delete user by using underage flow`, () => {
                cy.task("systemLog", `underage flow`);
                const aboutYouCalSection = (crmSelector.editProfile.aboutYouSection).split(" h2")[0] + " " + crmSelector.registration.reactCalendarIcon;
                const ineligibleYearValue = new Date().getFullYear();
                const goToIneligibleYear = () => {
                    cy.get(crmSelector.editProfile.reactCalTitleSection).then(($value) => {
                        const currentCalTitle = $value.text();
                        if (!currentCalTitle.includes(ineligibleYearValue)) {
                            cy.get(crmSelector.editProfile.reactCalNext).click({force: true});
                            goToIneligibleYear();
                        }
                    });
                };
                cy.get(aboutYouCalSection).click({force: true});
                goToIneligibleYear();
                cy.wait(500);
                cy.xpath(generateDateForCalendar()).click({force: true});
                cy.wait(500);
                cy.get(crmSelector.editProfile.saveBtn, {timeout: 1500}).click({force: true});
                cy.task("systemLog", `underage flow done, verify ineligible section`);
                cy.get(crmSelector.editProfile.ineligible, {timeout: 15000}).should(`be.visible`);
            });
            it(`verify user cannot connect`, () => {
                cy.task("systemLog", `underage ${globalThis.params.garbage.tempEmailAddress} cannot connect`);
                const tempUrl = `${localizedUrl}/${crmProperties.registration.properties[registrationScopeElement].localizedPath.registration}`;
                cy.visit(encodeURI(tempUrl), {timeout: 60000});
                cy.intercept(globalThis.params.appProperties.apiToWaitBeforeTest.method,
                    globalThis.params.appProperties.apiToWaitBeforeTest.path).as("commonCssLoginPage");
                cy.get(crmSelector.login.loginTab, {timeout: 10000}).click({force: true});
                cy.wait("@commonCssLoginPage", {timeout: 15000}).its('response.statusCode').should('eq', 200);
                cy.get(crmSelector.login.email, {timeout: 7500}).type(globalThis.params.garbage.tempEmailAddress);
                delete globalThis.params.garbage.tempEmailAddress;
                cy.get(crmSelector.login.password).type(crmSelector.properties.password);
                cy.get(crmSelector.login.submitLoginFormBtn).click({force: true});
                cy.get(crmSelector.login.errorMessageSection, {timeout: 5000}).should(`be.visible`);
            })
        }
    });
});