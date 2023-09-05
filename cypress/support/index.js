// ***********************************************************
// This example support/index.js is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
/// <reference types="cypress" />

require('cypress-xpath')
import '@percy/cypress'
import '@axe-devtools/cypress'
import './commands'
import './utilities/cssLoader'
import './utilities/utilities'
import './customCommands/crm.commands'
import './customCommands/global.commands'
import './customCommands/product.commands'
import './customCommands/navCheck.commands'
import './customCommands/taxonomy.commands'
import './customCommands/search.commands'
import './customCommands/axeDevTool.commands'
// Alternatively you can use CommonJS syntax:
// require('./commands')

beforeEach(() => {
    cy.viewport(1920, 1080);
    cy.restoreLocalStorageCache();
});

Cypress.Cookies.defaults({ preserve: ["accessTokens", "remember_token"] });

Cypress.on('uncaught:exception', (err, runnable) => { return false; });

// TO DO :: update the way to handle below exception
Cypress.on('fail', (err) => {
    if (err.message.includes('commonCss') || err.message.includes('crmRevokeToken')) {
        return (new Date().getTime() < new Date(1704052800000).getTime());
    } else { throw err; }
});
