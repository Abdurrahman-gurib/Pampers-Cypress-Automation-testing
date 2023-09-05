/// <reference types="Cypress" />

const profile = require('../../fixtures/base-profile.json')
const market = profile.testsuite.market.find(testsuite => testsuite.name === 'pampers-fr-fr')

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
            cy.get('.logo__container').find('img').should('have.attr', 'src').should('include', '.svg')

        })

        it("Verify that the anchor link on the Pampers Logo navigates to the homepage", () => {
            cy.get('.nav').find('a').should('have.attr', 'href').should('include', '/')
        })


    })

    describe("[" + platform + "][Footer Verification]", () => {

        it("Verify that Pampers Logo is displayed", () => {
            cy.get('[data-action-detail="ENG_ALLSITE_FOOTER_OTHER_ALL_pampers-logo"]').should('exist')
            cy.get('.footer-container ').find('a').should('have.attr', 'href').should('include', '/')
        })

        it("Verify that social icons are present", () => {
            cy.get('.f-social li:nth-child(1)').find('img').should('have.attr', 'title').should('include', 'Facebook')
            cy.get('.f-social li:nth-child(2)').find('img').should('have.attr', 'title').should('include', 'YouTube')
            cy.get('.f-social li:nth-child(3)').find('img').should('have.attr', 'title').should('include', 'Instagram')            
        })     

        it("Verify that copyright information is displayed", () => {
            cy.get('.footer-oasis__pg-title').should('be.visible')
            cy.get('.footer-oasis__pg-description').find('a').should('have.attr', 'href').should('include', 'https://www.pg.com/fr_FR/terms_conditions/index.shtml')
            cy.get('.copyright__img').should('exist')
        })
    })
})