/// <reference types="Cypress" />

const profile = require('../../fixtures/base-profile.json')
const market = profile.testsuite.market.find(testsuite => testsuite.name === 'pampers-en-us')

market.device.forEach((platform) => {

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
            cy.wait(5000)
            // wait for left menu then go to embedded section
            cy.xpath("//button//span[@class='btn-content']//span[contains(.,'The Size of the Fetus at 40 Weeks Pregnant')]", {timeout: 5000})
                .click({ force: true, multiple: true });
            cy.get('[data-action-detail="ENG_PREGNANCY_TOOL_EMBEDDED_ALL_bng_filter_Gender_Unisex"]', {timeout: 10000}).click({ force: true })
            cy.get('[data-action-detail="ENG_PREGNANCY_TOOL_EMBEDDED_ALL_bng_filter_Theme_Cute"]').click({ force: true })
            
            // wait for left menu then go to embedded section
            cy.xpath("//button//span[@class='btn-content']//span[contains(.,'The Size of the Fetus at 40 Weeks Pregnant')]", {timeout: 15000})
            .click({ force: true, multiple: true });
            cy.get("p[class='intro_title']").scrollIntoView();
            cy.get('[data-cy="baby-name-list"]')
                .should('exist')
                .should('be.visible')
            //Add to Favorites
            cy.get(':nth-child(1) > .item-star > svg').click({ force: true })
            // cy.get('footer').scrollIntoView()
            // cy.get('.thank-you-container span').should('be.visible')
            // cy.get('.thank-you-container').find('.btn-close').click({ force: true, multiple: true })
            // cy.get('.thank-you-container').should('not.be.visible')
            //Reset Filter
            cy.get('[data-action-detail="ENG_PREGNANCY_TOOL_EMBEDDED_ALL_bng_filter_reset"]').click({ force: true })
            cy.wait(1000)
            cy.xpath('//button[contains(@data-action-detail,"show-results")]').click({ force: true })
            cy.xpath('//button[contains(@data-action-detail,"see-all-results")]').click({ force: true })

            cy.url().should('contain', 'Gender=U&Theme=Cute')
        })
    })
})
