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
        cy.navigateToUrl('coupon', market)
    })

    afterEach(() => {
        cy.saveLocalStorageCache();
    })

    //--------------------------Test Steps------------------------------
    describe("[" + platform + "][Coupon Verification]", () => {

        it("Verify user can add a coupon to cart and needs to login before printing the coupon", () => {
            cy.get('footer').scrollIntoView()
            cy.get('.basket-cta__oval > .font-primary').should('be.visible')
            
            cy.get(':nth-child(1) > [data-cy=coupon-module] .event_coupon_request > .font-primary',{timeout: 15000}).click({ force: true })

            cy.get('.coupon-module__fade', {timeout: 15000}).should('exist')
            // cy.wait(1500)
            cy.get('.basket-cta__oval > .font-primary', {timeout: 15000}).should('be.visible')
            cy.get('.basket-cta__oval > .font-primary', {timeout: 15000}).should('have.text', 1)

            cy.get('.basket-cta__oval > .font-primary').click({ force: true })
            cy.get('[data-action-detail="REG_OFFERS_OTHER_CTA_ALL_offers-page_basket_register"]').click({ force: true })
            cy.get('.registration-form').should('exist')
        })

        it("Verify user can remove a coupon to cart", () => {
            cy.get('.basket-cta__count').click({ force: true })
            cy.get('.event_close_window > svg').click({ force: true })
            cy.reload()
            cy.get('.basket-cta__count').should('have.text', 0)
        })

        it("Verify UI components are present", () => {
            cy.get("p[class='offerlist__coupon--results']").should('be.visible')
            cy.get('.basket-cta__wrapper').should('be.visible')
            cy.get('.coupon-module').should('exist')
        })

    })
})