/// <reference types="Cypress" />

const properties = require('../../fixtures/testProperties/webpagetest.properties.json');
const selectors = require('../../fixtures/cssSelector/webpagetest.selectors.json');
const { getMarketsScope } = require('../../support/utilities/utilities');

(getMarketsScope(properties)).forEach(market => {
    describe(`Webpagetest for ${market}`, () => {
        before(() => {
            cy.clearCookies();
            cy.clearLocalStorage();
        });
        beforeEach(() => { cy.viewport(1920, 1080); });
        it(`Open ${properties.toolUrl}`, () => {
            cy.task(`systemLog`, `open ${properties.toolUrl} | market ${market}`);
            cy.visit(properties.toolUrl);
        });
        it(`Run test for ${market}`, () => {
            const baseUrl = globalThis.params.pampersUrls.prod[market];
            cy.task(`systemLog`, `fill in the input with market url ${market} => ${baseUrl}`);
            cy.get(selectors.input).type(baseUrl).then(() => {
                cy.task(`systemLog`, `run the test`);
                cy.get(selectors.submit).click();
            });
        });
        it(`Test queued / in progress`, () => {
            cy.task(`systemLog`, `Awaiting for result page`);
            const getTestStatus = () => {
                cy.get(selectors.runningStatus, {timeout: 5000}).then(($value) => {
                    const currentStatus = $value.text();
                    cy.task(`systemLog`, `current status ${currentStatus}`);
                });
            };
            getTestStatus();
            // 7.5mins time out to avoid err in case of queued
            cy.get(selectors.testStatus, {timeout: 480000}).should(`have.class`, selectors.statusActive).then(() => {
                cy.task(`systemLog`, `Test in progress`);
                getTestStatus();
                // webpagetest take 1min for en-us, set timeout to 7.5mins to avoid false positive
                cy.get(selectors.resultBody, {timeout: 480000}).should("be.visible");
                cy.task(`systemLog`, `Test completed and ${selectors.resultBody} displayed`);
            });
        });
        it(`Save result page`, () => {
            cy.url().then($url =>{
                cy.task(`systemLog`, `get url ${$url}`);
                const filename = `${market}_${($url.split("result/")[1]).replace("/", "")}`;
                cy.screenshot(
                    `webpagetest/${filename}`
                    , {capture: `fullPage`, timeout: 60000});
            });
        });
    });
});