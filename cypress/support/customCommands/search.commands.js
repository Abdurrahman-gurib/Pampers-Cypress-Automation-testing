const { generateRandomText } = require("../utilities/utilities");

Cypress.Commands.add(`openSearchSection`, (argSearchSelectors) => {
    const newNav = globalThis.params.garbage.isNewNav;
    cy.task(`systemLog`,`open search section in header - newNav ${newNav}`);
    cy.get(newNav ? argSearchSelectors.newNav.navMenu : argSearchSelectors.search.navMenu, {timeout: 10000}).click({force: true});
});
Cypress.Commands.add(`firstPopularSearchCheck`, (argSearchSelectors) => {
    cy.task(`systemLog`,`open first popular item`);
    const resultPageSection = (argSearchSelectors.resultPage.genericResultSection).split(`[contains(.,'%generic%')]`)[0];
    cy.xpath(argSearchSelectors.search.firstPopularSuggestion, {timeout: 10000}).click({force: true});
    cy.xpath(`(${resultPageSection})[1]`, {timeout: 10000}).should(`be.visible`);
    cy.url().then($resultPageUrl => { cy.task(`systemLog`,`first popular item result page url ${$resultPageUrl}`); });
    cy.xpath(`//div[contains(@class, 'custom404')]`).should(`not.exist`);
});
Cypress.Commands.add(`openNoResultPage`, (argSearchSelectors) => {
    cy.openSearchSection(argSearchSelectors).then(() => {
        const randomText = generateRandomText();
        cy.task(`systemLog`,`open no result page for random text ${randomText}`);
        cy.get(argSearchSelectors.search.field, {timeout: 10000})
            .type(randomText, {force: true});
        cy.get(argSearchSelectors.search.btn).click({force: true});
    });
});
Cypress.Commands.add(`noResultPageLayout`, (argSearchSelectors) => {
    cy.task(`systemLog`,`check no result page layout`);
    cy.get(argSearchSelectors.resultPage.noResSection, {timeout: 10000})
        .should(`be.visible`).then(() => {
            cy.get(argSearchSelectors.resultPage.topSearchSection).should(`be.visible`);
            cy.get(argSearchSelectors.resultPage.offersSection).should(`not.exist`);
    });
});
Cypress.Commands.add(`autoSuggestionLogic`, (argSearchSelectors, argSearchText) => {
    cy.task(`systemLog`,`auto suggest logic for text ${argSearchText}`);
    // test auto suggestion not appears when char length < 3
    cy.openSearchSection(argSearchSelectors);
    for(let compt = 1; compt < 4; compt++) {
        const tempCharToType = argSearchText.slice(0,compt);
        cy.task(`systemLog`,`auto suggest not present for '${tempCharToType}'`);
        cy.get(argSearchSelectors.search.field, {timeout: 5000}).type(tempCharToType);
        cy.wait(1500);
        cy.get(argSearchSelectors.search.autoSuggestionSection).should(`not.exist`);
        cy.get(argSearchSelectors.search.field, {timeout: 5000}).clear({force: true});
    }
    // auto suggestion ON when char 4+
    const tempCharAutoSuggest = argSearchText.slice(0,4);
    cy.task(`systemLog`,`auto suggest present for '${tempCharAutoSuggest}'`);
    cy.get(argSearchSelectors.search.field).type(tempCharAutoSuggest);
    cy.get(argSearchSelectors.search.autoSuggestionSection).should(`exist`);
    // check if first and second result are 2 differents value
    const tempAutoSuggestLI = (argSearchSelectors.search.autoSuggestionSection).slice(1);
    cy.xpath(`(//div[@class='${tempAutoSuggestLI}']//li)[1]`).then($firstValue => {
        const firstValue = $firstValue.text();
        cy.xpath(`(//div[@class='${tempAutoSuggestLI}']//li)[2]`).then($secondValue => {
            cy.task(`systemLog`,`check first and second auto suggest dont have the same value`);
            const secondValue = $secondValue.text();
            if (firstValue === secondValue) {
                throw new Error (`ERR! expect first (${firstValue}) and second (${secondValue}) auto-suggestion is different`);
            }
        });
    });
});
Cypress.Commands.add(`resultPageLayout`, (argSearchSelectors, argLocalizedResultSection, argPromoBannerIsPresent, argOffersIsPresent) => {
    cy.task(`systemLog`,`check result page section`);
    (Object.getOwnPropertyNames(argLocalizedResultSection)).forEach(resSectionElement => {
        cy.xpath((argSearchSelectors.resultPage.genericResultSection).replace(`%generic%`, argLocalizedResultSection[resSectionElement]),
            {timeout: 10000}).should(`be.visible`);
    });
    cy.task(`systemLog`,`check result page promo banner`);
    cy.get(argSearchSelectors.resultPage.promoBanner)
        .should(argPromoBannerIsPresent ? `be.visible` : `not.exist`);
    cy.get(argSearchSelectors.resultPage.offersSection)
        .should(argOffersIsPresent ? `be.visible` : `not.exist`);
    cy.task(`systemLog`,`verify status 200 for result img`);
    cy.xpath(argSearchSelectors.resultPage.resultFirstImgTag).invoke(`attr`, `src`).then($imgSrcValue => {
        cy.task(`systemLog`, `check status code for img src ${$imgSrcValue}`);
        cy.request({
            "method":`GET`,
            "url": $imgSrcValue
        }).then(response => {
            cy.task(`systemLog`, `img status code response ${response.status}`);
            expect(response.status).to.eq(200);
        });
    });
    // open first element
    cy.task(`systemLog`,`open first element in result page`);
    cy.xpath(argSearchSelectors.resultPage.firstResult).click({force: true}).then(() => {
        cy.wait(5000);
        cy.url().then($currentPageUrl => {
            cy.task(`systemLog`, `verify no 404 on first result | url ${$currentPageUrl}`);
            cy.xpath(`//div[contains(@class, 'custom404')]`).should(`not.exist`);
        });
    });

});