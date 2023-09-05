/// <reference types="Cypress" />

const navProperties = require('../../fixtures/testProperties/navCheck.properties.json');
const pampersMarketsUrlEnv = require('../../fixtures/testProperties/pampersUrls.properties.json');
const navSelector = require('../../fixtures/cssSelector/navCheck.selectors.json');
const { getMarketsScope } = require('../../support/utilities/utilities');

(getMarketsScope(navProperties, null)).forEach(scopeElement => {
    const baseUrl = pampersMarketsUrlEnv[navProperties.env][scopeElement];
    describe(`[Navigation Check][${scopeElement}]`, ()=>{
        it (`[Navigation Check][${scopeElement}][Open Home Page][${scopeElement}]`, () => {
            cy.openUrl(baseUrl);
        });
        it (`[Navigation Check][${scopeElement}][Loop]`, () => {
            cy.task(`systemLog`, `Get Urls List`);
            cy.navCheck(navSelector, baseUrl, navProperties.exclude[scopeElement] || null);
        });
    });
});
