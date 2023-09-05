/// <reference types="Cypress" />

const { generateDateForCalendar } = require('../../support/utilities/utilities');
const profile = require('../../fixtures/base-profile.json')
const market = profile.testsuite.market.find(testsuite => testsuite.name === 'pampers-en-us')

market.device.forEach((platform) => {
  describe("[" + platform + "][ergobaby]", () => {
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
      cy.navigateToUrl('ergobaby', market)
    })

    afterEach(() => {
      cy.saveLocalStorageCache();
    })

    //--------------------------Test Steps------------------------------

    it('Verify valid registration flow', () => {
      cy.wait(5000);
      cy.checkMetaAttributeContains(`noindex`, true);
      cy.wait(5500);
      const randomEmail = market.email + '_' + Math.random().toString(36).substring(5) + '@gmail.com'
      cy.get('input[name="emailAddress"]').click({force: true});
      cy.get('input[name="firstName"]').type(market.firstname)
      cy.get('input[name="newPassword"]').type('Testing123')
      cy.get('input[name="emailAddress"]').type(randomEmail)
      cy.get(`div[class='date-field-calendar-icon']`, { timeout: 1000 }).click({force: true});
      cy.xpath(generateDateForCalendar(), { timeout: 1000 }).click({force: true});

      //Verify opt-ins are unchecked
      cy.get('input[name="optSimilacSignup"]').uncheck({ force: true })
      //babylist is currently deactivated
      //cy.get('input[name="optBabyListSignup"]').uncheck({ force: true })
      cy.wait(1000)
      cy.get('.submit-button-container span').click({ force: true, multiple: true })
      //cy.wait(1000)
      //Verify redirection to thank you page after registration
      cy.url().should('include', 'en-us/thank-you-page-ergobaby')
      cy.get('.header-logo').should('exist')
      //cy.wait(3000)
      // cy.get("span[role='link']").should('exist')
      //Verify link redirects to homepage
      //cy.get("span[role='link']").click({ force: true, multiple: true })
      //cy.wait(500)
      //cy.get("span[role='link']").click({ force: true})
      //cy.wait(2000)
      //cy.get('.thank-you__link').should('not.exist')
      //cy.url().should('include', market.baseUrl)
      cy.visit(market.baseUrl)

      //Verify Cookie created successfully
      cy.getCookie('accessTokens').should('exist')
    })
  })
})