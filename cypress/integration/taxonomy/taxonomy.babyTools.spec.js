/// <reference types="Cypress" />

const crmSelector = require('../../fixtures/cssSelector/pampersCrm.selectors.json');
const babyToolsProperties = require('../../fixtures/testProperties/babyTools.properties.json');
const babyToolsSelectors = require('../../fixtures/cssSelector/babyTools.selectors.json');
const jsonExcel = [];
// link to babyToolElement post registration
const babyToolSelector = {
    "BNG": "div[class=' btn-container']",
    "DDC": ".ddct-btn",
    "BGC": ".bgc-btn",
    "WGC": ".wgc-btn"
};
const babyToolSelectorRes = {
    "BNG": "div[class=' btn-container']",
    "DDC": ".ddcr-container",
    "BGC": ".tab-body",
    "WGC": "main[class='page-container container']"
};
const btStaticLabel = [
    "ENG_PREGNANCY_TOOL_OTHER_ALL",
    "REG_PREGNANCY_TOOL_CTA_ALL",
    "REG_REG-PAGE_OTHER_OTHER_ALL",
    "LOG_ALLSITE_OTHER_OTHER_ALL",
    "ENG_ALLSITE_OTHER_OTHER_ALL",
    "ENG_PREGNANCY_TOOL_ARTICLE-PUSH_ALL",
    "ENG_REG-PAGE_OTHER_OTHER_ALL",
    "ENG_PREGNANCY_TOOL_HYPERLINK_ALL",
    "ENG_BABY_TOOL_HYPERLINK_ALL",
    "ENG_BABY_TOOL_CTA_ALL",
    "ENG_PREGNANCY_TOOL_CTA_ALL"
];

["en-US"].forEach(scopeElement => {
    const tempMarketToTest = babyToolsProperties.markets[scopeElement];
    const tempMarketBaseUrl = globalThis.params.pampersUrls[babyToolsProperties.env][scopeElement];
    tempMarketToTest.babyTools.forEach(babyToolElement => {
        if (!babyToolElement.includes(`CGP`)) {
            const tempBabyToolUrl = `${tempMarketBaseUrl}/${tempMarketToTest.localizedPath[babyToolElement]}`;
            describe(`[Pampers ${scopeElement}][Baby Tool][${babyToolElement}]`, () => {
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
                it(`[${babyToolElement}] REG`, () => {
                    cy.wait(15000);
                    cy.getDADJsonExcel(`babyTool ${babyToolElement} registration page`, `[data-cy='registration-form-component']`, [
                        "REG_REG-PAGE_OTHER_OTHER_ALL", "LOG_ALLSITE_OTHER_OTHER_ALL", "ENG_REG-PAGE_OTHER_OTHER_ALL"], (res) => {
                            jsonExcel.push.apply(jsonExcel, res);
                            cy.writeFile(`cypress/results/taxonomy/taxonomy_bt.json`, jsonExcel);
                    });
                    cy.genericRegistrationForm([""], { timeout: 1000 });
                    cy.wait(15000);
                });
                it (`Post-registration page - result`, () => {
                    cy.task("systemLog", `post registration for dad as logged user`);
                    cy.getDADJsonExcel(`babyTool ${babyToolElement} result page`, babyToolSelectorRes[babyToolElement], btStaticLabel, (res) => {
                        jsonExcel.push.apply(jsonExcel, res);
                        cy.writeFile(`cypress/results/taxonomy/taxonomy_bt.json`, jsonExcel);
                    });
                });
                if (!babyToolElement.includes(`BNG`)) {
                    it(`[${babyToolElement}] Back to Tool page`, () => {
                        cy.task(`systemLog`, `Open Baby tool page ${tempBabyToolUrl}`);
                        cy.intercept(globalThis.params.appProperties.apiToWaitBeforeTest.method,
                            globalThis.params.appProperties.apiToWaitBeforeTest.path).as("commonCss");
                        cy.visit(tempBabyToolUrl, {timeout: 60000});
                        cy.wait("@commonCss", {timeout: 15000}).its('response.statusCode').should('eq', 200);
                    });
                    it (`Tool Page - logged User`, () => {
                        cy.task("systemLog", `post registration for dad as logged user`);
                        cy.getDADJsonExcel(`babyTool ${babyToolElement} tool page as logged user`, babyToolSelector[babyToolElement], btStaticLabel, (res) => {
                            jsonExcel.push.apply(jsonExcel, res);
                            cy.writeFile(`cypress/results/taxonomy/taxonomy_bt.json`, jsonExcel);
                        });
                    });
                }
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
        }
    });
});