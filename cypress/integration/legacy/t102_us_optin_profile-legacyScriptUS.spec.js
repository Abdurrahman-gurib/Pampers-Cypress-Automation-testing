/// <reference types="Cypress" />

const profile = require('../../fixtures/base-profile.json')
const market = profile.testsuite.market.find(testsuite => testsuite.name === 'pampers-en-us')

market.device.forEach((platform) => {
    describe("OptIn Verification via Profile", () => {

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
            //cy.navigateToUrl('ddclp-unlocked', market)
        })

        afterEach(() => {
            cy.saveLocalStorageCache();
        })

        //--------------------------Test Steps------------------------------
        const email = 'jean.max-01@gmail.com'
        const password = 'Testing123'
        //Get registration data response from Janrain
        const testurl = 'https://procter-gamble.us.janraincapture.com/oauth/auth_native_traditional'
        const options = {
            method: 'POST',
            url: testurl,
            form: true, // indicates the body should be form urlencoded and sets Content-Type: application/x-www-form-urlencoded headers
            body: {
                signInEmailAddress: email,
                currentPassword: password,
                flow_version: '20181219143041919747',
                flow: 'pampers_us',
                locale: 'en-US',
                client_id: '94rzukfatrasdjettw6fbx8hm9gwp3tz',
                form: 'signInForm',
                redirect_uri: 'https://localhost'
            }
        }

        it('Verify that Optin value is correctly saved after update', () => {
            //Verify Optin status is checked ('true')
            let firstCheckOptinStatus = true;
            
            cy.viewport(1920, 1080);
            cy.visit("https://www.pampers.com/en-us/registration") //, { timeout: 40000 }   

            cy.request(options).then((response) => {
                expect(response).property('status').to.equal(200)
                const token = response.body.access_token
                expect(token).to.not.to.be.null
                // const optin_id = 'capture_user.optIns[0].optId'
                const response_optid = response.body.capture_user.optIns[0].optId
                const response_optstatus = response.body.capture_user.optIns[0].optStatus
                //cy.log(response_optid)
                expect(response_optid).to.equal('128_03');
                firstCheckOptinStatus = response_optstatus;
                cy.task("systemLog", `Optin Status First check ${firstCheckOptinStatus}`);
                // expect(response_optstatus).to.be.true

                //cy.navigateToUrl('flexibleArticle', market)
                cy.login('pampers-en-us', email, password, null)
                cy.wait(10000)
                cy.visit("https://www.pampers.com/en-us/edit-profile")
                cy.get('.newsletter-section > [data-cy=accordion-form] > .c-accordion > .accordion-head > .accordion-title',
                    {timeout: 15000}).click();
                cy.get('.c-checkbox > svg').click({ force: true, multiple: true })
                cy.get('.event_profile_update_submit').click({ force: true })
                cy.wait(7000)
                cy.logout(market.name)
                
                cy.wait(5000)
                cy.request(options).then((response) => {
                    expect(response).property('status').to.equal(200)
                    const token = response.body.access_token
                    expect(token).to.not.to.be.null
                    // const optin_id = 'capture_user.optIns[0].optId'
                    const response_optid = response.body.capture_user.optIns[0].optId
                    const response_optstatus = response.body.capture_user.optIns[0].optStatus
                    //cy.log(response_optid)
                    expect(response_optid).to.equal('128_03')
                    cy.task("systemLog", `optin status after manual update ${response_optstatus} and first check ${firstCheckOptinStatus}`);
                    firstCheckOptinStatus
                        ? expect(response_optstatus).to.be.false
                        : expect(response_optstatus).to.be.true
                })
            });
        })
    })
})