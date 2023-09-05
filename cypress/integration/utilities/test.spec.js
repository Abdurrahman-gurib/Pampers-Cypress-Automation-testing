/// <reference types="Cypress" />

(getCrmMarketsScope(crmProperties.editProfile)).forEach(el => {
    describe(`describe - ${el}`, () => {
        it(`it - ${el}`, () => {
            cy.log(el);
            cy.visit(`https://www.google.com`);
            cy.wait(5000);
            cy.task(`systemLog`, `OK`);
        });
    });
});