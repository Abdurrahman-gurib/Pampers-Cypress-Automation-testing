/// <reference types="Cypress" />

const axeDevToolsProperties = require('../../fixtures/testProperties/axeDevTools.properties.json');
const { getMarketsScope } = require('../../support/utilities/utilities');

if (Cypress.env(`market`)) {
    axeDevToolsProperties.market[Cypress.env(`market`)].forEach((urlRelative, elementIndex) => {
        const urlElement = axeDevToolsProperties.baseUrl[Cypress.env(`market`)][Cypress.env(`baseUrl`)] + urlRelative + `?disable-gtm`;
        const elementID = elementIndex;
        const axeDevToolRes = [];
        describe(`#${elementID} - AxeDevTools Scan`, () => {
            before(() => {
                cy.clearCookies();
                cy.clearLocalStorage();
            });
            it(`#${elementID} - open ${urlElement}`, () => {
                cy.task(`systemLog`, `#${elementID} - start ${urlElement}`);
                cy.openUrl(encodeURI(urlElement), 10000,{timeout: 60000});
            });
            it(`#${elementID} - scroll bottom - top`, () => {
                cy.task(`systemLog`, `#${elementID} - lazy load - scroll to bottom`);
                cy.scrollTo('bottom', { ensureScrollable: false, easing: 'linear', duration: 1000, force: true });
                cy.wait(1000);
                cy.task(`systemLog`, `#${elementID} - lazy load - scroll to bottom`);
                cy.scrollTo('top', { ensureScrollable: false, easing: 'linear', duration: 1000, force: true });
            });
            it(`#${elementID} - run axeAnalyze`, () => {
                cy.axeAnalyze();
                cy.task(`systemLog`, `process scan result`);
                cy.getAxeResults().then(result => {
                    for (const temp of result.findings.violations) {
                        if (axeDevToolsProperties.impact.find(elementSeverity => elementSeverity == temp.impact)) {
                            axeDevToolRes.push({
                                "severity": temp.nodes[0].impact,
                                "url": urlElement,
                                "error": temp.nodes[0].failureSummary,
                                "html": temp.nodes[0].html
                            });
                        }
                    }
                    // generate log or display in console
                    if (axeDevToolsProperties.generateJson) {
                        cy.task(`systemLog`, `generate json report`);
                        cy.writeFile(`cypress/results/axeDevTool-report.json`, axeDevToolRes);
                    } else { 
                        axeDevToolRes?.length? cy.task(`generateTable`, axeDevToolRes) : cy.task(`systemLog`, `Axe - no issues found`);
                    }
                });
            });
            it(`#${elementID} - verify if result contains critical / serious / minor`, () => {
                // throw err in case we meet impact condition
                if (axeDevToolRes?.length) {
                    throw Error (`FAIL! a11y issue on this page pls check log`);
                } else { cy.task(`systemLog`,`PASS! a11y no issues on this page`); }
            });
        });
    });
} else {
    describe(`AxeDevTools Scan`, () => {
        it(`No market configured`, () => { cy.task(`systemLog`, `env market null`); });
    });
}
