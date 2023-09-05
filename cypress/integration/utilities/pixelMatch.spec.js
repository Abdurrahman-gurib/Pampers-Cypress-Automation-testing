/// <reference types="Cypress" />

const properties = require('../../fixtures/testProperties/pixelMatch.properties.json');

describe(`[Pixel Match][${properties.alias}]`, () => {
    const manifest = {
        "infos": `PixelMatch for ${properties.alias} | ${properties.urls.length} urls | ${new Date().toGMTString()}`,
        // "statusCodeError": {
        //     "total": 0,
        //     "data": []
        // },
        "pixelMatchError": {
            "total": 0,
            "data": []
        }
    };
    properties.urls.forEach(url => {
        it(url, () => {
            cy.viewport(1920, 1080);
            cy.task("systemLog", `pixel match | ${properties.alias} | ${properties.compare} | ${properties.indicative}`);
            cy.task("systemLog", url);
            cy.intercept(globalThis.params.appProperties.adoric, (req) => { req.destroy(); });
            cy.visit(encodeURI(url), {failOnStatusCode: false, timeout: 60000});
            // cy.request({url: url, failOnStatusCode: false}).then((response) => {
            //     cy.task(`systemLog`, `status code ${response.status}`);
            //     if (response.status !== 200) {
            //         manifest.statusCodeError.total++;
            //         manifest.statusCodeError.data.push({
            //             "url": url,
            //             "code": response.status
            //         });
            //     }
            // });
            const dontWait = [
                "/ergobaby-gift", "/article/", "-trimester", "-months-pregnant",
                "-month-pregnant", "-weeks-pregnant", "/best-baby-products/"];
            // as aligned with Kavish, no need to wait for infinity scroll appears.
            let timeToWait = 5000;
            for (const tempElement of dontWait) {
                if (url.includes(tempElement)) { 
                    timeToWait = 250;
                    break;
                }
            }
            // use scrollTo to trigger lazy load and wait other js ...
            cy.scrollTo('bottom', { ensureScrollable: false, easing: 'linear', duration: 1000, force: true });
            cy.wait(timeToWait);
            cy.scrollTo('top', { ensureScrollable: false, easing: 'linear', duration: 1000, force: true });
            cy.wait(timeToWait);
            // // take screenshot and save in temp folder based on compare = true or false
            const fileName = url.split(properties.indicative)[1].replace(/\//g, '_').slice(1) || "home";
            cy.screenshot(
                `${properties.alias}/${properties.compare ? "compare" : "base"}/${fileName}`
                , {capture: `fullPage`, timeout: 60000 , overwrite: true});
            if (properties.percy) {
                cy.percySnapshot(fileName);
            }
            else {
                const path = `cypress/reports/screenshots/utilities/pixelMatch.spec.js/${properties.alias}`;
                if (properties.compare) {
                    cy.task(`pixelMatch`, (`./${path}|${fileName}`)).then((diff) => {
                        if (diff.err) {
                            cy.task(`systemLog`, `pixelMatch found ${diff.res} differences on ${fileName} | ${properties.alias}`);
                            manifest.pixelMatchError.total++;
                            manifest.pixelMatchError.data.push({
                                "file": fileName,
                                "url": url,
                                "pixelMatchResult": diff.res
                            });
                            cy.writeFile(`${path}/manifest.json`, manifest);
                        }
                    });
                }
            }
        });
    });
});