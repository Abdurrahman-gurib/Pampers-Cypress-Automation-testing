/// <reference types="Cypress" />

const profile = require('../../fixtures/base-profile.json')
const market = profile.testsuite.market.find(testsuite => testsuite.name === 'pampers-en-us')

market.device.forEach((platform) => {

    //---------------Before & After Initialisation---------------------
    before(() => {
        //utils.setViewport(device);
        cy.clearCookies();
        cy.clearLocalStorage();
    })

    beforeEach(() => {
        cy.restoreLocalStorageCache();
        Cypress.Cookies.preserveOnce('accessTokens', 'remember_token')
        cy.platform(platform)
        //Navigate to the test url
        cy.visit(market.baseUrl)
    })

    afterEach(() => {
        cy.saveLocalStorageCache();
    })

    after(() => {
        cy.logout(market.name)
    })

    //--------------------------Test Steps------------------------------
    describe("[" + platform + "][Header Verification]", () => {

        it("Verify that navigation bar is present", () => {
            cy.get('.nav').should('exist')
        })

        it("Verify that Pampers Logo is present", () => {
            cy.get('.logo__container').find('img').should('have.attr', 'alt').should('include', 'Pampers')

        })

        it("Verify that the anchor link on the Pampers Logo navigates to the homepage", () => {
            cy.get('.nav').find('a').should('have.attr', 'href').should('include', '/en-us')
        })


    })

    describe("[" + platform + "][Footer Verification]", () => {

        it("Verify that Pampers Logo is displayed", () => {
            cy.get('[data-action-detail="ENG_ALLSITE_FOOTER_OTHER_ALL_pampers_logo"]').should('have.attr', 'href').should('include', '/')
        })

        it("Verify that social icons are present", () => {
            cy.get('.social-icon--list a[aria-label="Facebook Icon"]').find('img').should('have.attr', 'alt').should('include', 'Facebook Icon')
            cy.get('.social-icon--list a[aria-label="Twitter icon"]').find('img').should('have.attr', 'alt').should('include', 'Twitter icon')
            cy.get('.social-icon--list a[aria-label="Pinterest icon"]').find('img').should('have.attr', 'alt').should('include', 'Pinterest icon')
            cy.get('.social-icon--list a[aria-label="Youtube icon"]').find('img').should('have.attr', 'alt').should('include', 'Youtube icon')
        })

        it("Verify that Accredited Business icon is present", () => {
            cy.get('.copyright__img').scrollIntoView()
            cy.wait(1200)
            cy.get('[data-action-detail="ENG_ALLSITE_FOOTER_OTHER_ALL_Accredited Business"]').should('be.visible')
        })

    })
})