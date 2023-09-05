/// <reference types="Cypress" />

const profile = require('../../fixtures/base-profile.json')
const { generateDateForCalendar } = require('../../support/utilities/utilities')
const market = profile.testsuite.market.find(testsuite => testsuite.name === 'pampers-en-us')

market.device.forEach((platform) => {
    describe("OptIn Verification via DDC Registration", () => {
        before(() => {
            cy.clearCookies();
            cy.clearLocalStorage(`accessTokens`);
            cy.clearLocalStorage(`remember_token`);
        })
        beforeEach(() => {
            cy.viewport(1920, 1080);
            cy.restoreLocalStorageCache();
        })

        //--------------------------Test Steps------------------------------      
        const randomEmail = 'proxqa_' + Math.random().toString(36).substring(5) + '@proximity.com'
        const password = 'Testing123'
        
        it (`open home page and save key and cookies to avoid server error on ddc (waiting third party)`, () => {
            //Navigate to the test url
            cy.intercept(globalThis.params.appProperties.apiToWaitBeforeTest.method,
                globalThis.params.appProperties.apiToWaitBeforeTest.path).as("commonCssHomepage");
            cy.visit(`https://www.pampers.com/en-us`, {timeout: 60000});
            cy.wait("@commonCssHomepage", {timeout: 15000}).its('response.statusCode').should('eq', 200);
            cy.saveLocalStorageCache();
        });
        it(`open ddc`, () => {
            cy.visit(`https://www.pampers.com/en-us/pregnancy/due-date-calculator`);
        });
        // new scenario will be done for vortex scenario checking and will include the optin test
        // it('Calculate Due Date via My last period option and Register', () => {
        //     cy.xpath(`(//div[@class='date-field-calendar-icon'])[1]`, { timeout: 15000 }).click({force: false});
        //     cy.xpath(generateDateForCalendar(), { timeout: 2500 }).click({force: false});

        //     cy.get('button[data-action-detail="ENG_PREGNANCY_TOOL_OTHER_ALL_ddc-find-out-now-cta"]', {timeout: 10000}).click({ multiple: true, force: true })
        //     cy.get('#open-email', {timeout: 15000}).type(randomEmail)
        //     cy.intercept(globalThis.params.appProperties.apiToWaitBeforeTest.method,
        //         globalThis.params.appProperties.apiToWaitBeforeTest.path).as("commonCss");
        //     cy.get('.open-email-submit-container button').click()
        //     cy.wait("@commonCss", {timeout: 20000}).its('response.statusCode').should('eq', 200);

        //     cy.get('input[name="firstName"]').clear()
        //     cy.get('input[name="firstName"]').type('Proximity JR Test')
        //     cy.get('input[name="newPassword"]').clear()
        //     cy.get('input[name="newPassword"]').type(password)
        //     cy.wait(7500)
        //     cy.get('.event_profile_register_submit').click()
        //     cy.get('.thank-you-container span', {timeout: 15000}).should('be.visible')

        //     //Get registration data response from Janrain
        //     const testurl = 'https://procter-gamble.us.janraincapture.com/oauth/auth_native_traditional'
        //     const options = {
        //         method: 'POST',
        //         url: testurl,
        //         form: true, // indicates the body should be form urlencoded and sets Content-Type: application/x-www-form-urlencoded headers
        //         body: {
        //             signInEmailAddress: randomEmail,
        //             currentPassword: password,
        //             flow_version: '20181219143041919747',
        //             flow: 'pampers_us',
        //             locale: 'en-US',
        //             client_id: '94rzukfatrasdjettw6fbx8hm9gwp3tz',
        //             form: 'signInForm',
        //             redirect_uri: 'https://localhost'
        //         }
        //     }
        //     //Verify Optin status
        //     cy.request(options).then((response) => {
        //         expect(response).property('status').to.equal(200)
        //         const token = response.body.access_token
        //         expect(token).to.not.to.be.null
        //         // const optin_id = 'capture_user.optIns[0].optId'
        //         const response_optid = response.body.capture_user.optIns[0].optId
        //         const response_optstatus = response.body.capture_user.optIns[0].optStatus
        //         //cy.log(response_optid)
        //         expect(response_optstatus).to.be.true
        //         expect(response_optid).to.equal('128_03')
        //     })
        // })
    })
})

