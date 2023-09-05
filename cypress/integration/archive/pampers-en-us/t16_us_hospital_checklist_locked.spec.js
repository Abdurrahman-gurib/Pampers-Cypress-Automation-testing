/// <reference types="Cypress" />

/* Test Workflow:
1.	Access tool using the direct URL as an anonymous in user.
2.	Click on the CTA “Register to view full list” button and verify page re-directs to Registration Page.
3.	Perform registration
4.	Verify page re-directs back to Hospital checklist and instant thank you is present on the top.
5.	Check the first checkbox for the first section.
6.	Verify the ‘Download PDF’ button is present.
7.	Perform logout.
8.	Verify that the first checkbox for the first section is unchecked.
9.	Verify ‘Register to view full list’ button is present. 
*/

const profile = require('../../fixtures/base-profile.json')
const market = profile.testsuite.market.find(testsuite => testsuite.name === 'pampers-en-us')

market.device.forEach((platform) => {
    describe("[" + platform + "][Hospital Checklist Locked Version]", () => {
        beforeEach(() => {
            cy.platform(platform)
            //Navigate to the test url
            cy.navigateToUrl('hospital-checklist-locked', market)
        })

        afterEach(() => {
            cy.saveLocalStorageCache();
        })

        //--------------------------Test Steps------------------------------
        const randomEmail = market.email + Math.random().toString(36).substring(5) + '@gmail.com'
        it('Verify user can view the full hospital checklist', () => {
            //cy.wait(5000)    
            cy.get("h3.sticky-summary-title", {timeout: 60000}).should('be.visible')   
            cy.wait(10000);

            cy.get('.download-btn-row a').should('have.attr', 'href').and('include', 'Hospital-Bag-Checklist')
        })
    })
})