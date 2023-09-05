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
        cy.navigateToUrl('bng-locked', market)
    })

    afterEach(() => {
        cy.saveLocalStorageCache();
    })

    describe("[" + platform + "][BNG] Embedded Baby Name Generator", () => {
        //--------------------------Test Steps------------------------------
        it('Verify filter criteria and components on the embedded page', () => {
            /* USER Workflow  
                Navigate to embedded page
                Select Unisex as gender
                Select Cute as theme
                Click on "Generate names"
                Register 
                Sticky thank you message appears after registration
                Close Thank you message
                System displays the number of baby names found (related to the filter criteria above)
                Click on Favorites
                //Sticky message appears to acknowledge name has beeb added to favorites
                Click reset filter link
                System displays the BNG LP again with the values still selected as from above criteria
                Click on "Generate names"
                System displays the number of baby names found (related to the filter criteria above)
                Click on the "See all names" button
                System redirects user to the BNG LP with the pre-selected values (see domain url and BNG LP)  
            */
            //chose "fille" as gender and "moderne" as theme
            cy.get(':nth-child(1) > .content > :nth-child(1) > [data-cy=filter-button] > .c-filter-button').should('exist')
            cy.get(':nth-child(1) > .content > :nth-child(1) > [data-cy=filter-button] > .c-filter-button').scrollIntoView()
            //cy.wait(2000)
            cy.get(':nth-child(1) > .content > :nth-child(1) > [data-cy=filter-button] > .c-filter-button').click({ force: true })
            cy.get(':nth-child(3) > [data-cy=filter-button] > .c-filter-button > .c-content > .btn-icon > svg').click({ force: true })
            cy.intercept(globalThis.params.appProperties.apiToWaitBeforeTest.method,
                globalThis.params.appProperties.apiToWaitBeforeTest.path).as("commonCss");
            cy.get('.btn-bng').click({ force: true })

            const randomEmail = market.email + Math.random().toString(36).substring(5) + '@gmail.com'
            //Register user
            //Fill in the data on the registration form
            cy.wait("@commonCss", {timeout: 20000}).its('response.statusCode').should('eq', 200);
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
            //cy.login('pampers-en-us', 'jacksparrowkely17@gmail.com', 'ExCalibuR123!', '')
            //Verify Sticky thank you message appears correctly
            cy.get('footer').scrollIntoView()
            cy.get('.thank-you-container span', {timeout: 15000}).should('be.visible')
            cy.get('.thank-you-container').find('.btn-close').click({ force: true })
            cy.get('.thank-you-container').should('not.be.visible')

            cy.get('.count__txt')
                .should('exist')
                .should('be.visible')

            cy.get('[data-cy="baby-name-list"]')
                .should('exist')
                .should('be.visible')
            //Add to Favorites
            cy.get(':nth-child(1) > .item-star > svg').click({ force: true })
            cy.get('footer').scrollIntoView()
            // cy.get('.thank-you-container span').should('be.visible')
            // cy.get('.thank-you-container').find('.btn-close').click({ force: true, multiple: true })
            // cy.get('.thank-you-container').should('not.be.visible')
            //Reset Filter
            cy.get('.reset__txt').click({ force: true })
            cy.wait(1000)
            cy.get('[data-action-detail="emb_baby_name_generator_show-results"]').click({ force: true })
            cy.get('[data-action-detail="emb_baby_name_generator_see-all-results"]').click({ force: true })

            cy.url().should('contain', 'Theme=Modern')
        })
    })
})