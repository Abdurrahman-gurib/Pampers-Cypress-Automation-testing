const profile = require('../../fixtures/base-profile.json')
const market = profile.testsuite.market.find(testsuite => testsuite.name === 'pampers-en-us')
const datalayerValues = globalThis.params.datalayerValues

describe("Check PG DataLayer Values", function(){
    before(() => {
        cy.clearCookies();
        cy.clearLocalStorage();
    });
    it('Visit homepage', function(){
        cy.visit(market.baseUrl)
        cy.wait(10000)
        cy.task(`systemLog`, `PGDataLayer test for ${market.name}`);
    })

    const pgDataLayerExpectedValue = [
        "BINPlatform", "FacebookConnectLocale", "GoogleAnalyticsLocal",
        "GoogleAnalyticsOptimizeContainerID", "Segment", "SiteLocalContainer",
        "SitePrivacyProtection", "SiteEnvironment"
    ];

    it(`Check pg dataLayer value`, () => {
        cy.window().then((win) => {
            const dataLayerObj = win.dataLayer;
            let compt = 0;
            for (const temp of dataLayerObj) {
                if (temp.hasOwnProperty("BINPlatform")) { break; }
                compt++;
            }
            cy.task("systemLog", `pgDataLayer Obj found P${compt} ===> ${JSON.stringify(win.dataLayer[compt])}`);
            pgDataLayerExpectedValue.forEach((pgDataLayerPropertiesName) => {
                cy.task("systemLog", `Verify PGDataLayer ${pgDataLayerPropertiesName}`);
                assert.equal(win.dataLayer[compt][pgDataLayerPropertiesName],
                    datalayerValues[market.name][pgDataLayerPropertiesName]);
            });
        })
    });

})