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
const market = profile.testsuite.market.find(testsuite => testsuite.name === 'pampers-fr-fr')

market.device.forEach((platform) => {
    describe("[" + platform + "][Hospital Checklist Locked Version]", () => {
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
            cy.navigateToUrl('hospital-checklist-locked', market)
        })

        afterEach(() => {
            cy.saveLocalStorageCache();
        })

        //--------------------------Test Steps------------------------------
        const randomEmail = market.email + Math.random().toString(36).substring(5) + '@gmail.com'
        it('Verify user can register to view the full hospital checklist', () => {
            //cy.wait(5000)    
            cy.intercept(globalThis.params.appProperties.apiToWaitBeforeTest.method,
                globalThis.params.appProperties.apiToWaitBeforeTest.path).as("commonCss");
            cy.get("span.sticky-summary-title.font-primary", { timeout: 60000 }).should('be.visible')
            cy.get('.btn-sub-scb', { timeout: 60000 })
                .should('be.visible')
                .click({ force: true, multiple: true })
            cy.wait(500)
            cy.wait("@commonCss", {timeout: 20000}).its('response.statusCode').should('eq', 200);
            //Fill in the data on the registration form
            cy.get('input[name="firstName"]').clear()
            cy.get('input[name="firstName"]').type(market.firstname)
            cy.get('[name="lastName"]').clear()
            cy.get('[name="lastName"]').type(market.firstname)
            cy.get('input[name="newPassword"]').clear()
            cy.get('input[name="newPassword"]').type('Testing123')
            cy.get('input[name="emailAddress"]').clear()
            cy.get('input[name="emailAddress"]').type(randomEmail)
            cy.get('[name="areYouParent"]').click({ force: true, multiple: true })
            cy.get('input[name="day"]').type('31')
            cy.get('input[name="month"]').type('12')
            cy.get('input[name="year"]').type('2020')

            cy.get('.submit-button-container span')//.find('button')
                .click({ force: true, multiple: true })

            cy.url().should('include', 'grossesse/preparer-le-sac-de-maternite')
            cy.get('.thank-you-container span').should('be.visible')
            //Verify Cookie created successfully
            cy.getCookie('accessTokens').should('exist')

            cy.get(':nth-child(2) > :nth-child(1) > [data-cy=checklist-category] > :nth-child(2) > .items > .checklist-content > .description > div > p').click()
            expect(cy.get(':nth-child(2) > :nth-child(1) > [data-cy=checklist-category] > :nth-child(2) svg')).to.exist
            cy.get('.download-btn-row a').should('have.attr', 'href').and('include', 'Hospital-Bag-Checklist-05-FR-min.pdf')

            cy.logout(market.name)
            cy.get('.sticky-register-section .btn-sub-scb').should('exist')
            cy.get(':nth-child(2) > :nth-child(1) > [data-cy=checklist-category] > :nth-child(2) svg').should('not.exist')
        })
    })
})