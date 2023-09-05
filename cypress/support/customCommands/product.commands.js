Cypress.Commands.add(`productLpBSOD`, (baseUrl, marketProperties, productSelector, bsodElement) => {
    const bsodUrl = `${baseUrl}/${marketProperties.bsod[bsodElement]}`;
    const xpathBsod = (productSelector.productLP.bsod).replace(`%filter%`, bsodElement);
    cy.task(`systemLog`, `BSOD - Open ${bsodElement}`);
    cy.visit(encodeURI(bsodUrl), {timeout: 60000});
    cy.task(`systemLog`, `BSOD - Verify ${bsodElement} Filter`);
    cy.xpath(xpathBsod).should(`exist`);
});

Cypress.Commands.add(`productLpOpen`, (baseUrl, marketProperties) => {
    const url = `${baseUrl}/${marketProperties.url}`;
    cy.intercept(globalThis.params.appProperties.apiToWaitBeforeTest.method,
        globalThis.params.appProperties.apiToWaitBeforeTest.path).as("commonCss");
    cy.task(`systemLog`, `open ${url}`);
    cy.visit(encodeURI(url), {timeout: 60000});
    cy.wait("@commonCss", {timeout: 15000}).its('response.statusCode').should('eq', 200);
});

Cypress.Commands.add(`productLpScrollIntoView`, () => {
    cy.get(`.copyright__img`, {timeout: 5000}).scrollIntoView({ easing: 'linear', duration: 1500, force: true });
    cy.wait(2500);
    cy.get(`.nav`).scrollIntoView({ easing: 'linear', duration: 1500, force: true });
});

Cypress.Commands.add(`productLpElementShouldBeVisible`, (elVisible) => {
    cy.task(`systemLog`, `should be visible => ${elVisible}`);
    cy.get(elVisible).should(`be.visible`);
});

Cypress.Commands.add(`productLpFilterElements`, (elFilter) => {
    cy.task(`systemLog`, `filter test - click on ${elFilter}`);
    cy.get(elFilter).click({multiple: true, force: true});
});

Cypress.Commands.add(`productLpDpSizeCalculator`, (productSelector, marketProperties) => {
    cy.task(`systemLog`, `diaper size calculator select 1 value`);
    cy.scrollTo('bottom', { easing: 'linear', duration: 2500, force: true });
    cy.get(productSelector.productLP.diaperSizeCalculator.section, {timeout:20000}).scrollIntoView();
    cy.get(productSelector.productLP.diaperSizeCalculator.section)
        .find(productSelector.productLP.diaperSizeCalculator.select)
        .select(marketProperties.diaperSizeCalculator, { force: true });    
    (productSelector.productLP.diaperSizeCalculator.result).forEach(dscElement => {
        cy.task(`systemLog`, `verify diaper size calculator result ${dscElement}`);
        cy.get(dscElement, {timeout: 5000}).should(`be.visible`);
    });
});

Cypress.Commands.add(`productLpSEO`, (productSelector) => {
    cy.task(`systemLog`, `SEO should not be empty`);
    cy.get(productSelector).should(`not.be.empty`);
});

Cypress.Commands.add(`productLpComparativeTable`, (productSelector, marketProperties) => {
    cy.task(`systemLog`, `Open comparative table`);
    cy.get(productSelector.section).click({force: true});
    marketProperties.forEach(cpElement => {
        cy.task(`systemLog`, `verify if ${cpElement} is present`);
        (cpElement.includes(".png"))
            ? cy.get(`[src='${cpElement}']`).should(`exist`)
            : cy.xpath(`//span[contains(.,'${cpElement}')]`).should(`exist`);
    });
    cy.task(`systemLog`, `close comparative table`);
    cy.get(productSelector.close).click({force: true});
});

Cypress.Commands.add(`productLpBin`, (marketProperties, productSelector) => {
    cy.task(`systemLog`, `BIN popin open correctly, img displayed and user can close the popin`);
    if (marketProperties.banner) {
        cy.xpath(`//button[contains(.,'${marketProperties.banner}')]`).click({force: true});
        cy.wait(7500);
    }
    const BINProperties = productSelector[marketProperties.type];
    cy.xpath(BINProperties.btn).then($binBtn => {
        if ($binBtn.is(':visible')) {
            $binBtn.click();
            cy.get(BINProperties.img, {timeout: 20000}).should(`have.attr`, `src`).and(`not.be.empty`);
        }
    });
});

Cypress.Commands.add(`productDpOpen`, (url, banner) => {
    cy.intercept(globalThis.params.appProperties.apiToWaitBeforeTest.method,
        globalThis.params.appProperties.apiToWaitBeforeTest.path).as("commonCss");
    cy.task(`systemLog`, `open ${url}`);
    cy.visit(encodeURI(url), {timeout: 60000});
    cy.wait("@commonCss", {timeout: 15000}).its('response.statusCode').should('eq', 200);
    if (banner) {
        cy.xpath(`//button[contains(.,'${banner}')]`).click({force: true});
    }
});

Cypress.Commands.add(`productDpVerifyBinBtn`, (binSelector, shopNowText, binSection, classColor) => {
    cy.task(`systemLog`, `verify bin button ${shopNowText}, ${binSection}, ${binSelector}, ${classColor}`);
    if (classColor.includes(`@`)) {
        const classColorDta = classColor.split(`@`);
        cy.task(`systemLog`, `color ${classColorDta[0]} and ${classColorDta[1]}`);
        // use rgb(115, 62, 189) instead of #733ebd but it's same color
        cy.get(`${binSection} ${binSelector}.${classColorDta[0]}`)
            .should(`have.css`, `background-color`).and(`eq`, classColorDta[1]);
    } else {
        cy.get(`${binSection} ${binSelector}.${classColor}`).contains(shopNowText);
    }
});

Cypress.Commands.add(`productDpVerifyElementIsVisible`, (argProductDpElement) => {
    cy.task(`systemLog`, `verify product dp element ${argProductDpElement}`);
    cy.get(argProductDpElement, {timeout: 5000}).first()
        .scrollIntoView({ easing: 'linear', duration: 1500, force: true }).should(`exist`);
});

Cypress.Commands.add(`productDpCtaLogin`, (argCtaSelector, argMarketCulture) => {
    let crmProperties = require('../../fixtures/testProperties/crm.properties.json');
    let login = argMarketCulture ? crmProperties.login.properties[argMarketCulture].login : "pampersqa@gmail.com";
    let password = argMarketCulture ? crmProperties.login.properties[argMarketCulture].password : "Testing123";
    cy.task(`systemLog`, `Click on CTA and complete login flow`);
    cy.get(argCtaSelector).click({force: true});
    cy.task(`systemLog`, `check if noindex is not present in reg page`);
    cy.wait(5000);
    cy.checkMetaAttributeContains(`noindex`, true);
    // login
    cy.get('a[title="Login"]', {timeout: 15000}).click({ force: true });
    cy.wait(20000);
    cy.get('input[type="email"]').type(login, { force: true });
    cy.get('input[type="password"]').type(password, { force: true });
    cy.get('button[title="submit"]').click({ force: true });
    crmProperties = null; login = null; password = null;
    cy.wait(15000);
});

Cypress.Commands.add(`productDpEmbeddedDiaperSizeCalculator`, (argDscSelector) => {
    cy.task(`systemLog`, `diaper size calculator`);
    cy.get(argDscSelector.embeddedToolSection).should(`be.visible`);
    cy.get(argDscSelector.embeddedToolSizeSelection).should(`be.visible`);
});