/// <reference types="Cypress" />

const profile = require('../../fixtures/base-profile.json')
const market = profile.testsuite.market.find(testsuite => testsuite.name === 'pampers-fr-fr')

market.device.forEach((platform) => {
  describe("[" + platform + "][DDC LP Unlocked]", () => {
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
      cy.navigateToUrl('ddclp-unlocked', market)
    })

    afterEach(() => {
      cy.saveLocalStorageCache();
    })

    //--------------------------Test Steps------------------------------
    describe("[" + platform + "][BabyTool][Unlocked] DDC LP Valid flow via date conceived", () => {
      it('Verify ddc components on page', () => {
        //Verify if due date calendar is present
        cy.get('[data-cy="ddc-landing-page"] .tool-container')
          .should('exist')
          .should('be.visible')

        //Due date calendar has image
        cy.get('[data-cy="ddc-landing-page"] [data-cy="top-banner-ddc"]')
          .should('exist')
          
        // cy.wait(2000)
        // cy.login('pampers-fr-fr', 'leo01@yahoo.com', 'Testing123', 'header')
      })

      it('Verify valid ddc flow via date conceived', () => {
        cy.wait(10000);
        cy.xpath("//button[contains(.,'Jour de conception')]", {timeout: 15000}).click({ force: true })
        cy.get(`div[class="form-date-i-conceived show"] > div > div > div > div[class="react-datepicker-wrapper"]`).click({ force: true })
        cy.wait(2000)
        
        cy.get(`div[class="date-field-calendar-icon"]`).click({ multiple: true, force: true});
        cy.xpath(`//div[contains(@class,'day--001')]`).click({ multiple: true, force: true});
        cy.xpath(`//button[contains(@class,"submit-button ")]`).click();
        
        cy.get('[data-cy="ddc-tool-result"]', {timeout: 15000})
          .should('exist')
          .should('be.visible')

        cy.get('[data-cy="ddc-tool-result"]')
          .find('.ddcr-date')
          .should('exist')
      })
    })

    // describe("[" + platform + "][BabyTool][Unlocked] DDC LP Valid flow via date of last period", () => {

    //   //--------------------------Test Steps------------------------------

    //   it('Verify valid ddc flow via date of last period', () => {
    //     cy.wait(15000);
    //     cy.xpath(`//button[contains(.,"Mes dernières règles")]`).click({ force: true })
    //     cy.xpath(`(//div[@class="date-field-calendar-icon"])[1]`).click({ force: true })
    //     cy.xpath(`//div[contains(@class,'day--010')]`).click({force: true});

    //     cy.wait(5000);

    //     cy.xpath(`//button[contains(@class,"submit-button ")]`, {timeout: 5000}).click({ multiple: true, force: true })
       
        
    //     cy.get('[data-cy="ddc-tool-result"]')
    //       .should('exist')
    //       .should('be.visible')

    //     cy.get('[data-cy="ddc-tool-result"]')
    //       .find('.ddcr-date')
    //       .should('exist')

    //     //Verify recalculate hyperlink is present
    //     cy.get('[data-cy="ddc-tool-result"]')
    //       .find('.ddcr-container')
    //       .find('.ddcr-recalculate')
    //       .find('button')
    //       .should('be.visible')
    //   })
    // })
  })
})
