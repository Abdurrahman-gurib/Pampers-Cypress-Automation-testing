/// <reference types="Cypress" />

const testProperties = require('../../fixtures/testProperties/search.properties.json');
const searchSelectors = require('../../fixtures/cssSelector/search.selectors.json');
const { getMarketsScope } = require('../../support/utilities/utilities');

['de-DE'].forEach(scopeElement => {
    const baseUrl = globalThis.params.pampersUrls[testProperties.env][scopeElement];
    const marketProperties = testProperties.markets[scopeElement];
    describe(`[Pampers][${scopeElement}][Search]`, () => {
        beforeEach(() => { cy.viewport(1920, 1080); });
        it (`[open home page]`, () => {
            cy.intercept(globalThis.params.appProperties.apiToWaitBeforeTest.method,
               globalThis.params.appProperties.apiToWaitBeforeTest.path).as("commonCss");
            cy.visit(encodeURI(baseUrl), {timeout: 60000});
            cy.wait("@commonCss", {timeout: 10000}).its('response.statusCode').should('eq', 200);
        });
        it(`[click on search icon in the navigation]`, () => { cy.openSearchSection(searchSelectors); });
        it(`[first popular search element open correctly]`, () => { cy.firstPopularSearchCheck(searchSelectors); });
        it(`[user can access -no result page-]`, () => { cy.openNoResultPage(searchSelectors); });
        it(`[verify -no result page- layout]`, () => {
            cy.task(`systemLog`, `no result page layout -> text section | top search section | no offers section`);
            cy.noResultPageLayout(searchSelectors);
        });
        it(`[verify auto suggestion appears 4+ Char]`, () => {
            cy.autoSuggestionLogic(searchSelectors, marketProperties.searchText);
            cy.get(searchSelectors.search.btn).click({force: true});
        });
        it(`[verify result page layout]`, () => {
            cy.task(`systemLog`, `result page layout and order -> `
                + `products | articles | tools | offers | download app banner if applicable`);
            cy.resultPageLayout(searchSelectors, marketProperties.localizedResultSection, marketProperties.promoBanner, marketProperties.offers);
        });
    })
});