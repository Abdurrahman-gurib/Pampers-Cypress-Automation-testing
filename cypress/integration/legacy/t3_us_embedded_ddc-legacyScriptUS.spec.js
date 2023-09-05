/// <reference types="Cypress" />
const profile = require('../../fixtures/base-profile.json');
const { generateDateForCalendar } = require('../../support/utilities/utilities');
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
    cy.navigateToUrl('dueDateCalendar', market)
  })

  afterEach(() => {
    cy.saveLocalStorageCache();
  })

  //--------------------------Test Steps------------------------------
  describe("[" + platform + "][BabyTool] Embedded DDC Valid Flow via date conceived", () => {

    it('Verify embedded ddc components on page', () => {
      //Verify if due date calendar is present
      cy.get('[data-cy="embedded-ddc"]')
        .should('exist')
        .should('be.visible')

      //Due date calendar has image
      cy.get('[data-cy="embedded-ddc"]').find('.eddc-image-icon')
        .find('svg')
        .should('exist')

      //Due date calendar has description
      cy.get('[data-cy="embedded-ddc"]').find('.eddc-description')
        .should('exist')
        .should('be.visible')

      //Due date calendar has method text
      cy.get('[data-cy="embedded-ddc"]').find('.eddc-method')
        .should('exist')
        .should('be.visible')
    })

    //--------------------------Test Steps------------------------------
    it('Verify valid DDC flow via date conceived', () => {
      cy.get(`div[class="corner-trigger-text corner-close-text"]`, {timeout: 20000}).click({force: true});
      cy.get('.copyright__img').scrollIntoView()
      cy.get('header').scrollIntoView()

      cy.get('p[class="feature-tool-title font-primary"]').scrollIntoView()
      cy.xpath(`(//div[@class='date-field-calendar-icon'])[1]`, { timeout: 5000 }).click({force: true});
      cy.wait(2500)
      cy.get('p[class="feature-tool-title font-primary"]').scrollIntoView()
      cy.xpath(generateDateForCalendar(), { timeout: 2500 }).click({force: true});
      cy.wait(500)
      cy.get('[data-cy="embedded-ddc"]').find('#prev-num')
        .click({ force: true })
    })
  })
})