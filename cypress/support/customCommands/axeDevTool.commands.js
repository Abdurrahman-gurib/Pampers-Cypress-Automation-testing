Cypress.Commands.add("axeDevToolRunAnalyze", (argLog, argRunInfoObj, argImpact) => {
    globalThis.params.garbage.accessibilityIsFailed = false;
    cy.axeAnalyze({log: true});
    cy.task(`systemLog`, `process scan result`);
    cy.getAxeResults().then(result => {
        for (const temp of result.findings.violations) {
            if (argImpact.find(elementSeverity => elementSeverity == temp.impact)) {
                globalThis.params.garbage.accessibilityIsFailed = true;
                globalThis.params.garbage.axeDevTool.push({
                    "severity": temp.nodes[0].impact,
                    "url": argRunInfoObj.url,
                    "error": temp.nodes[0].failureSummary,
                    "html": temp.nodes[0].html
                });
            }
        }
    });
});

Cypress.Commands.add("axeDevToolCheckIfErr", (argLog) => {
    cy.task(`systemLog`, `check if we have impact critical / serious / medium -> throw err ${globalThis.params.garbage.accessibilityIsFailed}`);
    if (globalThis.params.garbage.accessibilityIsFailed) {
        throw Error (argLog);
    } else { cy.task(`systemLog`,`no err`); }
});