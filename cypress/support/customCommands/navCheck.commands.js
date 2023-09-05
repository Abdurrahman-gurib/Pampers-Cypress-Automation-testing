Cypress.Commands.add("navCheck", (argNavSelector, argBaseUrl, argExcludeList) => {
    cy.get(argNavSelector.menuIndicator).then((dataUrl) =>{
        cy.task(`systemLog`, `Save Urls`);
        cy.viewport(1920,1080);
        const urlsToOpen = dataUrl; let count = 1;
        for (const tempArrayUrls of urlsToOpen) {
            const runTest = !argExcludeList
                ? true
                : !argExcludeList.includes(tempArrayUrls.innerText) ? true : false ;
            if (runTest) {
                cy.task(`systemLog`, `---------START---------`);
                cy.task(`systemLog`, `${count}/${urlsToOpen.length} | ${tempArrayUrls.innerText} | ${tempArrayUrls.href}`);
                cy.visit(tempArrayUrls.href);
                cy.task(`systemLog`, `check status 200`);
                cy.url().then($url =>{
                    cy.request($url).should((response) => {
                        expect(response.status).to.eq(200);
                    })
                });
                cy.task(`systemLog`, `check if navigation menu is visible`);
                cy.get(argNavSelector.navigation).should('be.visible');
                cy.task(`systemLog`, `check if home breadcrumb is visible`);
                cy.get(argNavSelector.breadcrumb).should('have.attr','href').then((breadcrumb) =>{
                    cy.task(`systemLog`, `verify if home breadcrumb url is correct | "${breadcrumb}"`);
                    // to avoid error if href value => "/", "baseUrl + /" or "baseUrl"
                    // note : "/" redirect to home page.
                    breadcrumb.startsWith("/")
                        ? expect(breadcrumb).to.equal("/")
                        : breadcrumb.split("/").length < 4
                            ? expect(breadcrumb).to.equal(argBaseUrl) : expect(breadcrumb).to.equal(argBaseUrl + "/");
                })
                cy.task(`systemLog`, `check if footer menu is visible`);
                cy.get(argNavSelector.footer).should('be.visible');
                cy.task(`systemLog`, `---------END---------`);
            } else {
                cy.task(`systemLog`, `Do not run ${tempArrayUrls.innerText} | ${tempArrayUrls.href}`);
            }
            count++;
        }
    })
});