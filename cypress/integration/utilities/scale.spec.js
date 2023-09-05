/// <reference types="Cypress" />

// scale generic to specific market
const appProperties = require('../../fixtures/app.properties.json');
const scaleProperties = appProperties.scale;
let baseFile = null;

describe(`start scaling from ${scaleProperties.file}`, () => {
    if (scaleProperties.file && scaleProperties.generic && scaleProperties.elements.length) {
        it(`get file`, () => {
            const genericFilePath = `./cypress/integration/${scaleProperties.file}.spec.js`;
            cy.readFile(genericFilePath, `utf8`).then((genericFile) => {
                baseFile = genericFile;
            });
        });
        for (const elToScale of scaleProperties.elements) {
            it(`scale - ${elToScale.static}`, () => {
                cy.task(`systemLog`, `copy ${scaleProperties.file} to ${elToScale.path} and replace ${scaleProperties.generic} with ${elToScale.static}`);
                const buildPath = `cypress/integration/${elToScale.path}/${(scaleProperties.file).split("/")[1]}.spec.js`;
                const marketData = baseFile.replace(scaleProperties.generic, elToScale.static);
                cy.writeFile(buildPath, marketData);
            });
        }
    } else {
        it(`NOTHING TO DO`, () => {
            cy.log(`something wrong in app.properties.json > scale`);
            cy.wait(5000);
        });
    }
});