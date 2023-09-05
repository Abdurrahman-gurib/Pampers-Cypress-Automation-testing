/// <reference types="Cypress" />

const profile = require('../../fixtures/base-profile.json')
const market = profile.testsuite.market.find(testsuite => testsuite.name === 'pampers-fr-fr')

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
      let originalResult, newResult = ''
  
      cy.get('[data-cy=main-article] .feedback-count').scrollIntoView()
      cy.wait(5000)
      cy.get('[data-cy=main-article] .feedback-count').should('be.visible')
  
      cy.get('[data-cy=main-article] .feedback-count').then(($likecount) => {
        cy.wait(5000)
        originalResult = $likecount.text()
        cy.log(originalResult)
        cy.get('.feedback-count-container > button').click({ multiple: true, force: true })
        cy.wait(2000)
        cy.get('.feedback-count-container > button', {timeout: 15000}).should('not.exist')
        cy.login('pampers-fr-fr', 'leo01@yahoo.com', 'Testing123', '')
        cy.wait(1000)
        cy.get('[data-cy=main-article] .feedback-count').scrollIntoView()
        cy.wait(5000)
        cy.get('[data-cy=main-article] .feedback-count').then(($likecount) => {
          newResult = $likecount.text()
          cy.log(newResult)
          expect(originalResult).eq(newResult);
        })
      })
    })

    // it('Verify feedback trigger the segmenta', () => {
    //   cy.get('[data-cy=main-article] .feedback-btn-container > span').scrollIntoView()
    //   cy.wait(3000)
    //   cy.get('[data-cy=main-article] [data-cy=feedback] > .feedback-container > .feedback-btn-container > span').should('exist')
    //   cy.get('[data-cy=main-article] [data-cy=feedback] > .feedback-container > .feedback-btn-container > span').click({ multiple: true, force: true })
    //   cy.wait(5000)
    //   cy.get('.modal-body .segmanta-embed').should('exist')
    // })
  })
})