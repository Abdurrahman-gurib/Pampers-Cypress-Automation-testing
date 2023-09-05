/// <reference types="Cypress" />

const fs = require("fs");
// we use only 1 spec for all markets.
const taxonomyProperties = require('../../fixtures/cssSelector/taxonomy.selectors.json');
const marketsToTest = taxonomyProperties.test;
const staticLabelList = taxonomyProperties.staticLabel;
Cypress.config("redirectionLimit", 150);

marketsToTest.forEach((market) => {
    const autoModeResult = {
        "market": market,
        "date": new Date().toString(),
        "cid": ""
    };
    const jsonForExcel = [];
    const scope = taxonomyProperties.scope[market];
    describe(`[Taxonomy][Pampers ${market}]`, () => {
        before(() => {
            cy.clearCookies();
            cy.clearLocalStorage();
        });
        beforeEach(() => {
            cy.viewport(1920, 1080);
            cy.restoreLocalStorageCache();
            Cypress.Cookies.preserveOnce('_ga');
        });
        afterEach(() => { cy.saveLocalStorageCache(); });
        scope.forEach((scopeElement) => {
            const tempFeaturesSpecification = taxonomyProperties.features[scopeElement];
            const tempUrl = tempFeaturesSpecification.urls[market];
            it(`Test ${scopeElement}`, () => {
                const viewPortValue = scopeElement.includes(`mobile`)
                    ? [390, 844]
                    : [1920, 1080];
                cy.viewport(viewPortValue[0], viewPortValue[1]);
                cy.task("systemLog", `Taxonomy ${market} | ${scopeElement} | ${tempUrl}`);
                if (scope.indexOf(scopeElement) === 0) {
                    cy.intercept(`POST`, `*j/collect*`).as(`gaCollect`);
                    cy.visit(tempUrl, {timeout: 60000});
                    cy.wait("@gaCollect", {timeout: 20000}).then((interception) => {
                        autoModeResult.cid = ((interception.request.url).split("cid=")[1]).split("&")[0];
                        cy.task(`systemLog`, `collect cid ${autoModeResult.cid}`);
                    });
                } else {
                    cy.visit(tempUrl, {timeout: 60000});
                }
                let tempSelector = tempFeaturesSpecification.selector;
                if (typeof(tempSelector) === "string") {
                    cy.task("systemLog", `Auto mode ON => ${tempSelector}`);
                    cy.task("systemLog", `scanOnlyForAutoMode :: ${taxonomyProperties.scanOnlyForAutoMode}`);
                    if (tempSelector.includes("body") || tempSelector.includes("html") || tempSelector === "") {
                        throw new Error ("Taxonomy test can't be run due to a non authorized action,"
                            + " please verify taxonomy.json or contact Test Automation Team");
                    } else {
                        autoModeResult[scopeElement] = {
                            "url": tempUrl,
                            "AUTO MODE": true,
                            "CSS Section": tempSelector,
                            "total": 0,
                            "data": []
                        };
                        cy.task("systemLog", `wait 15s due to some elements are not present on load`);
                        cy.wait(12000);
                        cy.scrollTo('bottom', { ensureScrollable: false, easing: 'linear', duration: 1000, force: true });
                        cy.wait(1000);
                        cy.scrollTo('top', { ensureScrollable: false, easing: 'linear', duration: 1000, force: true });
                        cy.wait(2500);
                        cy.get(`${tempSelector} [data-action-detail]`).then((dataActionObj) => {
                            cy.task("systemLog", `generate data action detail for test`);
                            const dataActionElement = dataActionObj;
                            for (let tempElement = 0; tempElement < dataActionElement.length; tempElement++) {
                                if (!dataActionElement[tempElement].outerHTML.includes("display:none")) {
                                    const tempClassName = dataActionElement[tempElement].className;
                                    if (
                                        !tempClassName.includes("event_share")
                                        && !tempClassName.includes("event_social")
                                    ) {
                                        const tempEventAction = dataActionElement[tempElement].dataset.actionDetail;
                                        const finalSelectorInCaseAutoModeON = `${dataActionElement[tempElement].tagName}`
                                            + `[data-action-detail="${tempEventAction}"]`;
                                        // get event name from class
                                        const getEventName = () => {
                                            cy.task("systemLog", `Get Event Name`);
                                            const classNameAsArray = tempClassName.split(" ");
                                            let res = classNameAsArray[0];
                                            if (classNameAsArray.length > 1 && !res.includes("event_")) {
                                                classNameAsArray.forEach((tempClassNameELement) => {
                                                    if (tempClassNameELement.includes("event_")) {
                                                        res = tempClassNameELement;
                                                        cy.task("systemLog", res);
                                                        return res;
                                                    }
                                                });
                                            }
                                            cy.task("systemLog", res);
                                            return res;
                                        };
                                        // get static part of data-action-detail
                                        const getStaticAndGenericLabel = (argReturn) => {
                                            // by default return static label
                                            // for Generic label argReturn => 1 
                                            cy.task("systemLog", `Get Static Label`);
                                            let res = " ";
                                            for(const temp of staticLabelList[scopeElement]){
                                                if (!temp.includes("%") && tempEventAction.includes(temp)) {
                                                    cy.task("systemLog", "No % in static label");
                                                    (argReturn === 1) ? res = tempEventAction.split(temp)[1] : res = temp;
                                                    cy.task("systemLog", res);
                                                    return res;
                                                } else {
                                                    let tempSplitedStaticLabel = temp.split("%");
                                                    cy.task("systemLog", `Static label contains % => ${temp}`);
                                                    if (tempEventAction.includes(tempSplitedStaticLabel[0])
                                                        && tempEventAction.includes(tempSplitedStaticLabel[1])) {
                                                            (argReturn === 1)
                                                                ? res = tempEventAction.replace(new RegExp(tempSplitedStaticLabel.join("|"), "g"), "")
                                                                : res = temp;
                                                            cy.task("systemLog", res);
                                                            return res;
                                                    }
                                                }
                                            }
                                            cy.task("systemLog", res);
                                            return res;
                                        }
                                        // save result for json file
                                        autoModeResult[scopeElement].total++;
                                        const getEventNameRes = getEventName();
                                        const genericAndStaticLabel = [
                                            getStaticAndGenericLabel(),
                                            getStaticAndGenericLabel(1)
                                        ];
                                        autoModeResult[scopeElement].data.push({
                                            "event label": tempEventAction,
                                            "event action": getEventNameRes,
                                            "static label": genericAndStaticLabel[0],
                                            "generic label": genericAndStaticLabel[1],
                                            "css selector": finalSelectorInCaseAutoModeON,
                                            "html class": tempClassName
                                        });
                                        if (taxonomyProperties.exportForExcel) {
                                            jsonForExcel.push({
                                                "feature": scopeElement,
                                                "url": tempUrl,
                                                "data-action-detail": tempEventAction,
                                                "event name": getEventNameRes,
                                                "static label":  genericAndStaticLabel[0],
                                                "generic label":  genericAndStaticLabel[1]
                                            });
                                        }
                                        cy.task("systemLog", `Click on #${tempElement} element => ${finalSelectorInCaseAutoModeON}`);
                                        if (!taxonomyProperties.scanOnlyForAutoMode) {
                                            cy.get(finalSelectorInCaseAutoModeON, {timeout: 10000}).click({force: true, multiple: true });
                                            // use visit instead of goo back because
                                            // data-action-detail may be present on accordion
                                            // or to show extend section
                                            cy.task("systemLog", `back to ${tempUrl}`);
                                            cy.visit(tempUrl, {timeout: 60000});
                                        }
                                    }
                                }
                            }
                        });
                    }
                } else {
                    cy.task("systemLog", "NORMAL MODE ON");
                    autoModeResult[scopeElement] = {
                        "url": tempUrl,
                        "AUTO MODE": false,
                        "total": tempSelector.length,
                        "data": []
                    };
                    tempSelector.forEach((dataActionDetail) => {
                        cy.get('body').then(($body) => {
                            let tempCssSelectorElement = dataActionDetail.includes("_level-")
                                ? `li[data-action-detail="${dataActionDetail}"]`
                                : `button[data-action-detail="${dataActionDetail}"]`;
                            if (!$body.find(tempCssSelectorElement).length) {
                                tempCssSelectorElement = `a[data-action-detail="${dataActionDetail}"]`
                            }
                            autoModeResult[scopeElement].data.push({
                                "event label": dataActionDetail,
                                "css selector": tempCssSelectorElement,
                            });
                            if (taxonomyProperties.exportForExcel) {
                                jsonForExcel.push({
                                    "feature": scopeElement,
                                    "url": tempUrl,
                                    "data-action-detail": dataActionDetail,
                                    "event name": "AUTO MODE FALSE",
                                    "static label":  "AUTO MODE FALSE",
                                    "generic label":  "AUTO MODE FALSE"
                                });
                            }
                            cy.task("systemLog", `Click on ${tempCssSelectorElement}`);
                            cy.get(tempCssSelectorElement, {timeout: 10000}).click();
                            cy.task("systemLog", `back to ${tempUrl}`);
                            cy.visit(tempUrl, {timeout: 60000});
                        })
                    });
                }
                cy.task("systemLog", "generate Taxonomy json file");
                cy.writeFile(`cypress/results/taxonomy/taxonomy_${market}.json`, autoModeResult);
                taxonomyProperties.exportForExcel ? 
                    cy.writeFile(`cypress/results/taxonomy/taxonomy_xls_${market}.json`, jsonForExcel)
                    : cy.task("systemLog", `JSON report for excel import false`);
            })
        });
    })
});
