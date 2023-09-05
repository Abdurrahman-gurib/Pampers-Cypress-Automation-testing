// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add("login", (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add("drag", { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add("dismiss", { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite("visit", (originalFn, url, options) => { ... })
/// <reference types="cypress" />
const profile = require('../fixtures/base-profile.json')

let LOCAL_STORAGE_MEMORY = {};

Cypress.Commands.add("saveLocalStorageCache", () => {
  Object.keys(localStorage).forEach(key => {
    LOCAL_STORAGE_MEMORY[key] = localStorage[key];
  });
});

Cypress.Commands.add("restoreLocalStorageCache", () => {
  Object.keys(LOCAL_STORAGE_MEMORY).forEach(key => {
    localStorage.setItem(key, LOCAL_STORAGE_MEMORY[key]);
  });
});

Cypress.Commands.add('platform', (platform) => {
  if (platform == "mobile") {
    cy.viewport('iphone-x')
    //cy.log("Platform => " + platform)
    //cy.log("User Agent => " + navigator.userAgent)
  }
  else {
    cy.viewport(1920, 1080)
  }
})

Cypress.Commands.add('register', (country, email, password, platform) => {
  const domain = profile.testsuite.market.find(testsuite => testsuite.name === country)
  cy.intercept(globalThis.params.appProperties.apiToWaitBeforeTest.method,
    globalThis.params.appProperties.apiToWaitBeforeTest.path).as("commonCss");
  if (platform == "header") {
    //Click on the Sign In link in navigation bar
    cy.get('.menu__option__authenticate > .item---link').click({ force: true })
  }
  if (platform == "restage") {
    //Click on the Sign In link in navigation bar - restage header
    cy.get('.item---link text-login event_profile_register').click({ force: true })
  }
  cy.wait(7500);
  cy.wait("@commonCss", {timeout: 20000}).its('response.statusCode').should('eq', 200);
  //Fill in the data on the registration form
  if (platform == "header") {
    cy.get('input[name="day"]').type('31')
    cy.get('input[name="month"]').type('12')
    cy.get('input[name="year"]').type('2020')
  }

  if (platform == "dob") {
    cy.get('input[name="day"]').type('31')
    cy.get('input[name="month"]').type('12')
    cy.get('input[name="year"]').type('2020')
  }

  if (domain.market == 'pampers-fr-fr') {
    cy.get('[name="lastName"]').clear()
    cy.get('[name="lastName"]').type('Holmes')
  }

  cy.get('input[name="firstName"]').clear()
  cy.get('input[name="firstName"]').type(domain.firstname)
  cy.get('input[name="newPassword"]').clear()
  cy.get('input[name="newPassword"]').type(password)
  cy.get('input[name="emailAddress"]').clear()
  cy.get('input[name="emailAddress"]').type(email)

  cy.get('.submit-button-container button') //.find('button')
    .click({ force: true, multiple: true })
  if (platform == "header") {
    cy.get('.menu__option__authenticate > .item---link')
      .should('be.visible')

    //Verify Cookie created successfully
    cy.getCookie('accessTokens').should('exist')
  }
})

Cypress.Commands.add('login', (country, email, password, header) => {
  const domain = profile.testsuite.market.find(testsuite => testsuite.name === country)  
  cy.intercept(globalThis.params.appProperties.apiToWaitBeforeTest.method,
     globalThis.params.appProperties.apiToWaitBeforeTest.path).as("commonCss");
  if (header) {
    //Click on the Sign In link in navigation bar
    cy.get("button.item---link.text-login.event_profile_register", {timeout: 5000}).click({ force: true, multiple: true })
  }
  //Click on Login tab
  cy.get('a[title="Login"]', {timeout: 15000}).click({ force: true })
  cy.wait("@commonCss", {timeout: 20000}).its('response.statusCode').should('eq', 200);
  cy.wait(7500);
  //Fill in data on the login form
  cy.get('input[type="email"]').type(email, { force: true })
  cy.get('input[type="password"]').type(password, { force: true })  
  cy.intercept(globalThis.params.appProperties.apiToWaitBeforeTest.method,
    globalThis.params.appProperties.apiToWaitBeforeTest.path).as("commonCssPostLogin");
  cy.get('button[title="submit"]').click({ force: true })
  if (country) { 
    cy.url().should('include', domain.baseUrl)
  }
  cy.wait("@commonCssPostLogin", {timeout: 20000}).its('response.statusCode').should('eq', 200);
  //Verify that user is logged in and that cookie is created
  cy.get('.menu__option__authenticate > .item---link', {timeout: 15000})
    .should('be.visible')
  cy.getCookie('accessTokens').should('exist')
})

Cypress.Commands.add('loginNoCommonJSToWait', (country, email, password, header) => {
  const domain = profile.testsuite.market.find(testsuite => testsuite.name === country)  
  if (header) {
    //Click on the Sign In link in navigation bar
    cy.get("button.item---link.text-login.event_profile_register", {timeout: 5000}).click({ force: true, multiple: true })
  }
  //Click on Login tab
  cy.get('a[title="Login"]', {timeout: 15000}).click({ force: true })
  cy.wait(20000);
  //Fill in data on the login form
  cy.get('input[type="email"]').type(email, { force: true })
  cy.get('input[type="password"]').type(password, { force: true })  
  cy.get('button[title="submit"]').click({ force: true })
  if (country) { 
    cy.url().should('include', domain.baseUrl)
  }
  cy.wait(15000);
  //Verify that user is logged in and that cookie is created
  cy.get('.menu__option__authenticate > .item---link', {timeout: 15000})
    .should('be.visible')
  cy.getCookie('accessTokens').should('exist')
})

Cypress.Commands.add('logout', (country) => {
  const domain = profile.testsuite.market.find(testsuite => testsuite.name === country)

  const loggedin = cy.get('.menu__option__authenticate > .item---link').should('exist')

  if (loggedin) {
    //Verify that user is logged out successfully and cookie is not present
    cy.get('.menu__option__authenticate .event_profile_logout')
      .click({ multiple: true, force: true })
    //cy.wait(2000)
    // if (domain.device == "mobile") {
    //   cy.get('[class="mobile-menu__button__container"] > button').click({ force: true })
    //   cy.get('[class="profile__container"] > button')
    //     .click({ force: true })
    //     .should('have.text', 'Sign up')
    // } else {
    //   cy.get('.menu__option__authenticate > .event_profile_register')
    //     .should('have.text', 'Sign up')
    // }
    cy.wait(2000)
    
    //cy.getCookie('accessTokens').should('not.exist')
  }
  else {
    cy.log("User is not logged in..Exiting!")
  }
})

Cypress.Commands.add('navigateToUrl', (content, market) => {
  cy.fixture('urls').then(($urls) => {
    const relativePath = content ? $urls[market.name][content] : "";
    cy.visit(market.baseUrl + relativePath) //, { timeout: 40000 }
    //code below is a workaround for full pageload
    //cy.get('footer').scrollIntoView()
    //cy.scrollTo("top", { duration: 500 });
    //cy.get('.logo__container img').should('exist')
    //cy.get('').should('have.attr', 'href', '/')
    //cy.get('h1').should('exist')
  })
})

Cypress.Commands.add('checkEmailValidity', (email) => {
  var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
})
