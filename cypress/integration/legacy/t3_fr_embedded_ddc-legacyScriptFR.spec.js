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
    cy.navigateToUrl('dueDateCalendar', market)
  })

  afterEach(() => {
    cy.saveLocalStorageCache();
  })

  //--------------------------Test Steps------------------------------
  describe("[" + platform + "][BabyTool] Embedded DDC Valid Flow via date conceived", () => {

    it('Verify embedded ddc components on page', () => {
      //Verify if due date calendar is present
      cy.get('[data-cy="embedded-ddc"]')
        .should('exist')
        .should('be.visible')

      //Due date calendar has image
      cy.get('[data-cy="embedded-ddc"]').find('.eddc-image-icon')
        .find('svg')
        .should('exist')

      //Due date calendar has description
      cy.get('[data-cy="embedded-ddc"]').find('.eddc-description')
        .should('exist')
        .should('be.visible')

      //Due date calendar has method text
      cy.get('[data-cy="embedded-ddc"]').find('.eddc-method')
        .should('exist')
        .should('be.visible')
    })

    //--------------------------Test Steps------------------------------
    it('Verify valid DDC flow via date conceived', () => {
      cy.get('footer').scrollIntoView()
      cy.get('header').scrollIntoView()

      cy.get('[data-cy="embedded-ddc"]').scrollIntoView()
      cy.wait(10000);
      cy.xpath("//button[contains(.,'Jour de conception')]", {timeout: 15000}).click({ force: true })
     cy.get(`div[class="form-date-i-conceived show"] > div > div > div > div[class="react-datepicker-wrapper"]`).click({ force: true })
      cy.wait(2000)
    /*  
      cy.get('input[name="day"]').eq(1).type('01', { force: true })
      cy.get('input[name="month"]').eq(1).type('12', { force: true })
      cy.get('input[name="year"]').eq(1).type('2022', { force: true })*/ 
      cy.get(`div[class="date-field-calendar-icon"]`).click({ multiple: true, force: true});
      cy.xpath(`//div[contains(@class,'day--001')]`).click({ multiple: true, force: true});

      cy.intercept(globalThis.params.appProperties.apiToWaitBeforeTest.method,
        globalThis.params.appProperties.apiToWaitBeforeTest.path).as("commonCss");
      cy.get('button[data-action-detail="REG_PREGNANCY_TOOL_EMBEDDED_ALL_ddc-register-to-find-out-now-cta"]').click({ multiple: true, force: true })
      //cy.get('button[data-action-detail="REG_PREGNANCY_TOOL_CTA_ALL_ddc-register-to-find-out-now-cta"]').click({ multiple: true, force: true })

      cy.wait(5000)

      const randomEmail = market.email + Math.random().toString(36).substring(5) + '@gmail.com'
      //Register user
      cy.wait("@commonCss", {timeout: 20000}).its('response.statusCode').should('eq', 200);
      cy.get('input[name="firstName"]', {timeout: 10000}).clear()
      cy.get('input[name="firstName"]').type(market.firstname)
      cy.get('[name="lastName"]').clear()
      cy.get('[name="lastName"]').type(market.firstname)
      cy.get('input[name="newPassword"]').clear()
      cy.get('input[name="newPassword"]').type('Testing123')
      cy.get('input[name="emailAddress"]').clear()
      cy.get('input[name="emailAddress"]').type(randomEmail)      
      //cy.get('[name="areYouParent"]').click({ force: true, multiple: true })
      // cy.get('input[name="day"]').type('31')
      // cy.get('input[name="month"]').type('12')
      // cy.get('input[name="year"]').type('2020')

      cy.get('.submit-button-container span')//.find('button')
        .click({ force: true, multiple: true })
      //cy.wait(6000)

      //Verify Sticky thank you message appears correctly
      cy.get('footer').scrollIntoView()
      cy.get('.thank-you-container span').should('be.visible')
      cy.get('.thank-you-container').find('.btn-close').click({ force: true })
      cy.get('.thank-you-container').should('not.be.visible')
      cy.get('[data-cy="ddc-result"]')
        .should('exist')
        .should('be.visible')

      //Verify Due date result appear correctly
      cy.get('[data-cy="ddc-result"]')
        .should('exist')
        .should('be.visible')

      cy.get('[data-cy="ddc-result"]')
        .find('.eddc-image-icon')
        .find('svg')
        .should('exist')

      cy.get('[data-cy="ddc-result"]')
        .find('.ddcr-date')
        .should('exist')
      //Verify success Logout
      cy.logout(market.name)
    })
  })


  describe("[" + platform + "][BabyTool] Embedded DDC Valid Flow via date of last period", () => {

    //--------------------------Test Steps------------------------------
    it('Verify valid ddc flow via date of last period', () => {
      cy.get('footer').scrollIntoView()
      cy.get('header').scrollIntoView()

      cy.get('[data-cy="embedded-ddc"]').scrollIntoView()
    
      cy.wait(15000);
      cy.xpath(`//button[contains(.,"Mes dernières règles")]`).click({ force: true })
      cy.xpath(`(//div[@class="date-field-calendar-icon"])[1]`).click({ force: true })
      cy.xpath(`//div[contains(@class,'day--001')]`).click({ multiple: true, force: true});

      cy.wait(5000);

      cy.xpath(`//button[contains(@class,"submit-button ")]`, {timeout: 5000}).click({ multiple: true, force: true })
      
      cy.get('.submit-button')
        .click({ force: true })

      cy.login('pampers-fr-fr', 'leo01@yahoo.com', 'Testing123', '')
      //cy.wait(10000);

      //Verify Due date result appear correctly
      cy.get('[data-cy=ddc-result]')
        .should('exist')
        .should('be.visible')
      //Verify Recalculate hyperlink is present
      cy.get('[data-cy="ddc-result"]')
        .find('.ddcr-container')
        .find('.ddcr-recalculate')
        .find('button')
        .should('be.visible')
      //Verify success Logout
      cy.logout(market.name)
    })
  })
})