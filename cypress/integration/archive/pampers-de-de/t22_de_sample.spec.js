/// <reference types="Cypress" />

const profile = require('../../fixtures/base-profile.json')
const market = profile.testsuite.market.find(testsuite => testsuite.name === 'pampers-de-de')

market.device.forEach((platform) => {
  describe("[" + platform + "][Sample Verification]", () => {
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
      //cy.navigateToUrl('sample-and-coupon', market)
    })

    afterEach(() => {
      cy.saveLocalStorageCache();
    })

    //--------------------------Test Steps------------------------------

    //Verify Components when no coupon and sample is present on website
    it('Verify breadcrumb is present', () => {
      //Navigate to the test url
      cy.navigateToUrl('sample-and-coupon', market)
      cy.wait(13000)
      cy.get('.c-breadcrumb__item.event_internal_link a').should('have.text', 'Home')
      cy.get('.arrow-breadcrumb').should('exist')
      cy.xpath("//li[contains(.,'Coupons, Proben & Angebote')]").should('exist')
    })

    it('Verify H1 is present', () => {
      cy.get('h1').should('have.text', 'Proben & Angebote')
    })

    it('Verify all text with p tags', () => {
      cy.get('p').should(($p) => {
        expect($p.eq(0), 'first item').to.contain('Spare bei deinen Lieblingswindeln und -feuchttüchern mit Pampers Angeboten. Einfach anmelden und sparen!')
        expect($p.eq(1), 'second item').to.contain('Gib 3 Codes ein und erhalte ein personalisiertes Shirt!')
        expect($p.eq(2), 'third item').to.contain('Momentan sind leider keine Proben oder Angebote verfügbar.')
        expect($p.eq(3), 'fourth item').to.contain('Schau in unserer Pampers Club App vorbei, dort erwarten dich viele tolle Prämien.')
        expect($p.eq(4), 'fifth item').to.contain('Überzeuge dich von Pampers fortschrittlichen Windeln und Feuchttüchern – denn wir bieten dir Gratisproben an. Melde dich einfach an oder registriere dich, um sie dir zu sichern!')
      })
    })

    it('Verify text for all buttons', () => {
      cy.get('.container.page-container a').should(($span) => {
        expect($span.eq(1), 'first item').to.contain('Jetzt entdecken')
        expect($span.eq(2), 'second item').to.contain('Jetzt herunterladen')
      })
    })

    it('Verify links for app Adjust buttons', () => {
      cy.get('.basic-banner_cta > div a').should('have.attr', 'href').and('equal', 'https://app.adjust.com/3xp5y0x_c1qzqfb?fallback=https%3A%2F%2Finstapage.pampers.de%2Fqr-code-app-download&redirect_macos=https%3A%2F%2Finstapage.pampers.de%2Fqr-code-app-download&web_traffic_source=pampers.de%2Freferral')
    })

    it('Verify all images alt text and source URL', () => {
      cy.get('.basic-banner_image img').should('have.attr', 'src').and('include', 'https://images.ctfassets.net')
      cy.get('.no-offer-banner_image img').should('have.attr', 'src').and('include', 'https://images.ctfassets.net')
      cy.get('[alt="heart"]').should('have.attr', 'src').and('equal', '/assets/images/icons/heart.png')
    })
    

    //it('Verify sample components are present on the page', () => {
    //  cy.get(".offers-pretext").should('exist')
    //  cy.get(".offers-title").should('exist')
    //  cy.get(".offers-subtitle").should('exist')
    //  cy.get('.sample-module__img--container img').should('be.visible')
    //  cy.get('.sample-description > h3').should('be.visible')
    //  cy.get('.btn-sub-offers').should('be.visible')
    //  cy.get('.btn-about').should('be.visible')
    //})

    //it('Verify that the product detail page is successfully displayed after user clicks on the about product button', () => {
    //  cy.get('.btn-about').click({force: true})
    //  cy.get('[data-cy="top-banner-product-detail"]').should('exist')
    //})

    //it('Verify that the registration form is displayed when user clicks on the order sample button', () => {
    //  cy.get('.btn-sub-offers').click({force: true})
    //  cy.url().should('contain', 'registrierung')
    //  cy.get('.registration-container').should('exist')
    //})

  })
})