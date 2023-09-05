/// <reference types="Cypress" />

const profile = require('../../fixtures/base-profile.json')
const market = profile.testsuite.market.find(testsuite => testsuite.name === 'pampers-en-us')

market.device.forEach((platform) => {
    describe("[" + platform + "][]", () => {
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


    })
})


