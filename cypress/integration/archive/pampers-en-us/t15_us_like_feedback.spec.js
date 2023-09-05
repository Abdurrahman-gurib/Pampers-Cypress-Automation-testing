/// <reference types="Cypress" />

const profile = require('../../fixtures/base-profile.json')
const market = profile.testsuite.market.find(testsuite => testsuite.name === 'pampers-en-us')

market.device.forEach((platform) => {
  describe("[" + platform + "][Editorial] Like & Feedback", () => {
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
      cy.navigateToUrl('flexibleArticle', market)
    })

    afterEach(() => {
      cy.saveLocalStorageCache();
    })

    //--------------------------Test Steps------------------------------

    it('Verify user can like an article', () => {
      cy.get('.copyright__img').scrollIntoView()
      let originalResult, newResult = ''
   
      cy.get('[data-cy=main-article] .feedback-count').scrollIntoView()
      cy.wait(15000)
      cy.get('[data-cy=main-article] .feedback-count').should('be.visible')
   
      cy.get('[data-cy=main-article] .feedback-count').then(($likecount) => {
        cy.wait(5000)
        originalResult = $likecount.text()
        if (!originalResult) {
          throw Error (`ERR! count ${originalResult}`);
        }
        cy.xpath(`(//button[contains(@class,'btn-feedback')])[1]`).click({ multiple: true, force: true })
        // cy.wait(3000)
        // cy.get('.feedback-count-container > button').should('not.exist')
        // cy.wait(8000);
        // cy.checkMetaAttributeContains(`noindex`, true);
        // cy.login('pampers-en-us', 'leo01@yahoo.com', 'Testing123', '')
        // cy.get('.copyright__img').scrollIntoView({ easing: 'linear', duration: 1500, force: true });
        // cy.get('[data-cy=main-article] .feedback-count').scrollIntoView({ easing: 'linear', duration: 1500, force: true });
        cy.get('[data-cy=main-article] .feedback-count').should('be.visible')
        // cy.get('[data-cy=main-article] .feedback-count').then(($likecount) => {
        //   newResult = $likecount.text()
        //   cy.log(newResult)
        //   expect(originalResult).eq(newResult);
        // })
        // cy.navigateToUrl('flexibleArticle', market)
        // cy.wait(5000);
        // cy.get('[data-cy=main-article] .feedback-btn-container > span').scrollIntoView()
        // cy.wait(5000)
        // cy.get('[data-cy=main-article] [data-cy=feedback] > .feedback-container > .feedback-btn-container > span').should('exist')
      })
    })
  })
})
