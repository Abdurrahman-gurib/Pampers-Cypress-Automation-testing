/// <reference types="cypress" />

const profile = require('../../fixtures/base-profile.json')
const market = profile.testsuite.market.find(testsuite => testsuite.name === 'pampers-en-us')

market.device.forEach((platform) => {
  describe("[" + platform + "][" + market.name + "][Editorial] Flexible Article", () => {
    //---------------Before & After Initialisation---------------------
    before(() => {
      //utils.setViewport(device);
      //clean browser state before tests
      cy.clearCookies();
      cy.clearLocalStorage();
    })

    beforeEach(() => {
      cy.restoreLocalStorageCache();
      Cypress.Cookies.preserveOnce('accessTokens', 'remember_token')
      cy.platform(platform)
    })

    afterEach(() => {
      cy.saveLocalStorageCache();
    })

    //--------------------------Test Steps------------------------------

    it('Verify Header components', () => {
      //Navigate to the page under test
      cy.openUrl(`https://www.pampers.com/en-us/baby/feeding/article/formula-feeding-guidelines`);
      //Verify if the Pampers Logo is present
      cy.get('header[class="l-header oasis"]')
        .find('a[class=event_banner_click]').find('img')
        .should('exist')
        .should('be.visible')

      //Verify if Pampers logo has alt attribute
      cy.get('header[class="l-header oasis"]')
        .find('a[class=event_banner_click]')
        .find('img')
        .should('have.attr', 'alt')

      //Get app section is visible in header on mobile
      if (platform == "mobile") {
        cy.get('header[class="l-header oasis"]')
          .find('.authentication__container')
          .should('exist')
          .should('be.visible')
      }

      //Verify Login/Register menu present on mobile
      if (platform == "mobile") {
        cy.get("div[class='mobile-menu__button__container']>button").click({ force: true, multiple: true })
        cy.get('header[class="l-header oasis"]')
          .find('.profile__container')
          .find('a[class="text-login profile__button profile__button--light event_profile_register"]')
          .should('exist')
          .should('be.visible')
      }
    })

    it('Verify Breadcrumbs', () => {
      cy.get('.c-breadcrumb li:nth-child(2)').should('be.visible')
      cy.get('.c-breadcrumb li:nth-child(2)').contains('Baby')
      cy.get('.c-breadcrumb li:nth-child(3)').contains('Feeding')
      cy.get('.c-breadcrumb li:nth-child(4)').contains('Formula Feeding Guidelines')
    })

    it('Verify Progress bar works correctly', () => {
      cy.get('[data-cy="progress-bar"]').should('exist').should('be.visible');
      //Progress bar status should change when I scroll the page
      cy.scrollTo(0, 1000, { easing: 'linear', duration: 1000 })
    })


    it('Verify H1 title is present', () => {
      cy.get('.article-header').find('h1')
        .should('exist')
        .should('be.visible')
    })

    it('Verify if the breadcrumb has 4 sections on desktop', () => {
      cy.get('[data-cy="breadcrumb"]')
        .find('li')
        .its('length')
        .should('eq', 4)
    })

    it('Verify if the breadcrumb has link configured on desktop', () => {
      cy.get('[data-cy="breadcrumb"]')
        .find('li:first')
        .find('a')
        .should('have.attr', 'href')
    })

    it('Verify that the breadcrumb has only category and subcategory on mobile', () => {
      if (platform == "mobile") {
        // cy.get('[data-cy="breadcrumb"]')
        //   .find('li')
        //   .its('length')
          //   .should('eq', 2)
          cy.get('[data-cy="breadcrumb"] [data-action-detail="ENG_ALLSITE_OTHER_OTHER_ALL_breadcrumb_Home_level-1"]')
            .should('have.attr', 'class', 'c-breadcrumb__item event_internal_link hide-mobile')
      }
    })

    it('Verify if Html table is visible', () => {
      cy.xpath("//span[contains(.,'How Much Formula Is Enough?')]", {timeout: 15000}).click({force: true, multiple: true });
      cy.get('[data-cy="html-table"]')
        .should('exist')
        .should('be.visible')
    })

    it('html table has scrollbar', () => {
      if (platform == "mobile") {
        cy.get('[data-cy="html-table"]')
          .should('have.css', 'overflow-x', 'scroll')
      }
    })

    it('Verify if the sticky summary is present', () => {
      if (platform == "mobile") {
        cy.get('.mobile-summary').should('exist')
      } else {
        cy.get('[data-cy="sticky-summary"]')
          .should('exist')
        //Item in the sticky summary is active
        cy.get('[data-cy="sticky-summary"]')
          .find('li[class="title active"]')
          .should('exist')
      }
    })


    it('Verify page scrolls feature on Sticky Summary', () => {
      if (platform == "mobile") {
        cy.get('.icon-adjust').click({ force: true })
        cy.get('.mobile-summary > .list > :nth-child(4) > .button-text > .btn-content > .text').click({ force: true })
        cy.get('[data-cy="progress-bar"]')
          .should('not.have.value', 0)

      } else {
        cy.get('[data-cy="sticky-summary"]')
          .get('li:nth-child(2)').click({ force: true, multiple: true })

        cy.get('[data-cy="progress-bar"]')
          .should('not.have.value', 0)
      }
    })

    it('Infinite Scroll_Scroll down to the end of the page, verify an article is present + 5 read more.',
      () => {
        cy.wait(5500);
        cy.get('.copyright__img').scrollIntoView({ easing: 'linear', duration: 2500 })
        // expect(cy.get('[data-cy="infinite-scroll"]', {timeout: 15000})).to.exist;
        cy.xpath('(//div[@data-cy="infinite-scroll"])[1]').scrollIntoView({ easing: 'linear', duration: 1000 });
        cy.wait(5500);
        cy.get('.footer-menu-wrapper').scrollIntoView({ easing: 'linear', duration: 3500 })
        cy.wait(2500);
        cy.get('.footer-menu-wrapper').scrollIntoView({ easing: 'linear', duration: 3500 })
        cy.wait(1500);
        cy.get('[data-cy="infinite-scroll"] .infinite-item .read-more-btn', {timeout: 15000}).should('have.length', 5);
      }
    )

    it('Verify Tagging carousel', () => {
      cy.xpath(`(//div[@data-cy="tag-carousel"]//a[@target="_self"])[1]`).should('exist');
    })

  })
})