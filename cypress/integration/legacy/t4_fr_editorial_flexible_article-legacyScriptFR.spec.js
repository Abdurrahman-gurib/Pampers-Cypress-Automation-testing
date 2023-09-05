/// <reference types="cypress" />

const profile = require('../../fixtures/base-profile.json')
const market = profile.testsuite.market.find(testsuite => testsuite.name === 'pampers-fr-fr')

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
      //Navigate to the page under test
      cy.navigateToUrl('flexibleArticle', market)
      cy.get('footer').scrollIntoView()
    })

    afterEach(() => {
      cy.saveLocalStorageCache();
    })

    //--------------------------Test Steps------------------------------

    it('Verify Header components', () => {
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

      //Pregancy tool icons have SVG format
      //cy.get('header[class="l-header oasis"]')
      //.find('.tools__container:first').find('.tools__col').each(($el) => {
      //cy.wrap($el)
      //    console.log($el)
      //      .find('a').find('img')
      //      .should('have.attr', 'src')
      //      .should('contain', '.svg')
      //  })

      //Get app section is visible in header on mobile
      if (platform == "mobile") {
        cy.get('header[class="l-header oasis"]')
          .find('.authentication__container')
          .should('exist')
          .should('be.visible')
      }

      //Verify Login/Register menu present on mobile
      if (platform == "mobile") {
        cy.get('header[class="l-header oasis"] [data-action-detail="BURGER_open"]').click({ force: true, multiple: true })
        cy.get('header[class="l-header oasis"]')
          .find('.profile__container')
          .find('a[class="text-login profile__button profile__button--light event_profile_register"]')
          .should('exist')
          .should('be.visible')
      }
    })

    it('Verify Footer components', () => {
      //Verify if footer has logo
      cy.get('footer[class="f"]').find('.logo').find('img')
        .should('exist')

      //Logo image has alt attribute
      cy.get('footer[class="f"]').find('.logo').find('img')
        .should('have.attr', 'alt')
    })

    it('Verify Progress bar works correctly', () => {
      cy.get('[data-cy="progress-bar"]').should('exist').should('be.visible');
      //Progress bar status should change when I scroll the page
      cy.scrollTo(0, 1000, { easing: 'linear', duration: 1000 })
      cy.get('[data-cy="progress-bar"]')
        .should('not.have.value', 0)
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
        cy.get('[data-cy="breadcrumb"] [data-action-detail="breadcrumb_Home_level-1"]')
          .should('have.attr', 'class', 'c-breadcrumb__item event_internal_link hide-mobile')
      }
    })

    it('Verify if Html table is visible', () => {
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
          .should('be.visible')
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

    it('Infinite Scroll_Scroll down to the end of the page, verify an article is present.',
      () => {
        cy.wait(3000)
        expect(cy.get('[data-cy="infinite-scroll"]')).to.exist;
        cy.get('[data-cy="infinite-scroll"]').scrollIntoView({ easing: 'linear', duration: 1000 });
      }
    )

    // // why run below test when we test 5 read more btn -_-
    
    // it('Infinite Scroll_Scroll down again and verify another article loads',
    //   () => {
    //     cy.wait(500)
    //     cy.get('[data-cy=footer] > .f').scrollIntoView();
    //     cy.get('[data-cy="infinite-scroll"] .infinite-item:last').scrollIntoView();
    //     expect(cy.get('[data-cy="infinite-scroll"] .infinite-item:last')).to.exist;
    //   }
    // )

    // it('Infinite Scroll_Verify a ‘Read more’ article is present.',
    //   () => {
    //     cy.wait(500)
    //     cy.get('[data-cy=footer] > .f').scrollIntoView();
    //     expect(cy.get('[data-cy="infinite-scroll"] .infinite-item:first .read-more-btn')).to.exist;
    //     cy.get('[data-cy="infinite-scroll"] .infinite-item:first .read-more-btn').scrollIntoView({ easing: 'linear', duration: 500, offset: { top: 100 - Cypress.config('viewportHeight') } });
    //   }
    // )

    // it('Infinite Scroll_Verify the ‘Read more’ button is present for the 2nd article.',
    //   () => {
    //     cy.wait(500)
    //     cy.get('[data-cy=footer] > .f').scrollIntoView();
    //     cy.get('[data-cy="infinite-scroll"] .infinite-item:first .read-more-btn').scrollIntoView({ easing: 'linear', duration: 500, force: true });
    //     expect(cy.get('[data-cy="infinite-scroll"] .infinite-item:first').next()).to.exist;
    //     expect(cy.get('[data-cy="infinite-scroll"] .infinite-item:first').next().find('.read-more-btn')).to.exist;
    //   }
    // )

    it('Verify there are 5 ‘read more’ buttons at the end of the page for infinite scroll',
      () => {
        cy.wait(5000);
        cy.get('[data-cy=footer] > .f').scrollIntoView();
        // cy.wait(1500);
        // cy.get('footer').scrollIntoView();
        cy.wait(10000);
        cy.get('[data-cy=footer] > .f').scrollIntoView();
        cy.wait(1500);
        cy.get(':nth-child(1) > .less-info > :nth-child(2) > .read-more-btn > span').scrollIntoView({ easing: 'linear', duration: 500, force: true });
        cy.get(':nth-child(2) > .less-info > :nth-child(2) > .read-more-btn > span').scrollIntoView({ easing: 'linear', duration: 500, force: true });
        cy.get(':nth-child(3) > .less-info > :nth-child(2) > .read-more-btn > span').scrollIntoView({ easing: 'linear', duration: 500, force: true });
        cy.get(':nth-child(4) > .less-info > :nth-child(2) > .read-more-btn > span').scrollIntoView({ easing: 'linear', duration: 500, force: true });
        cy.get(':nth-child(5) > .less-info > :nth-child(2) > .read-more-btn > span').scrollIntoView({ easing: 'linear', duration: 500, force: true });
        cy.get('[data-cy="infinite-scroll"] .infinite-item .read-more-btn').should('have.length', 5);
      }
    )
    
    // // why... see above test it's same code -_-

    // it('Infinite Scroll_Verify the ‘Read more’ button is present for the 2nd article. Verify there are only 4 ‘read more’ buttons at the end of the page',
    //   () => {
    //     cy.wait(500)
    //     cy.get('[data-cy=footer] > .f').scrollIntoView();
    //     cy.get(':nth-child(1) > .less-info > :nth-child(2) > .read-more-btn > span').scrollIntoView({ easing: 'linear', duration: 500, force: true });
    //     cy.get(':nth-child(2) > .less-info > :nth-child(2) > .read-more-btn > span').scrollIntoView({ easing: 'linear', duration: 500, force: true });
    //     cy.get(':nth-child(3) > .less-info > :nth-child(2) > .read-more-btn > span').scrollIntoView({ easing: 'linear', duration: 500, force: true });
    //     cy.get(':nth-child(4) > .less-info > :nth-child(2) > .read-more-btn > span').scrollIntoView({ easing: 'linear', duration: 500, force: true });
    //     cy.get(':nth-child(5) > .less-info > :nth-child(2) > .read-more-btn > span').scrollIntoView({ easing: 'linear', duration: 500, force: true });
    //     cy.get(':nth-child(1) > .less-info > :nth-child(2) > .read-more-btn > span').click({ force: true });
    //     cy.get('[data-cy="infinite-scroll"] .infinite-item .read-more-btn').should('have.length', 4);
    //   }
    // )

    it('Verify Signup component is present', () => {
      cy.get('[data-cy="signup-banner"]')
        .should('exist')
        .should('be.visible')
    })

    it('Verify invalid email on Sign up component', () => {
      cy.wait(10000);
      cy.xpath("(//input[@type='email'])[1]").type('1234', {force: true })
      cy.wait(1500);
      cy.xpath("(//button[@title='Inscrivez-vous MAINTENANT'])[1]").click({force: true, multiple: true})
      cy.wait(1500);
      //Error message is displayed
      cy.get('p.err-msg', {timeout: 5000})
        .should('exist')
        .should('be.visible')
    })

    it('Verify Tagging carousel', () => {
      cy.get('[data-cy="tag-carousel"] .carousel-row > li > a:nth-child(1)')
        .should('exist')
      cy.get('[data-cy="tag-carousel"] .carousel-row > li > a:nth-child(1)')
        .should('have.attr', 'target', '_self')
    })

    it('Verify valid email on Sign up component', () => {
      cy.wait(10000);
      cy.xpath("(//input[@type='email'])[1]").type("alfred@yahoo.com", { force: true })
      cy.xpath("(//button[@title='Inscrivez-vous MAINTENANT'])[1]").click({ force: true, multiple: true})
      cy.url().should('include', 'inscription')
    })

    it('Verify Breadcrumbs', () => {
      cy.wait(500)
      cy.get('[data-cy=footer] > .f').scrollIntoView();
      cy.get('.c-breadcrumb li:nth-child(2)').should('be.visible')
      cy.get('.c-breadcrumb li:nth-child(2)').contains('Nouveau-né')
      cy.get('.c-breadcrumb li:nth-child(3)').contains('Développement du nouveau-né')
      cy.get('.c-breadcrumb li:nth-child(4)').contains('Les réflexes de bébé et du nouveau-né')
    })

  })
})