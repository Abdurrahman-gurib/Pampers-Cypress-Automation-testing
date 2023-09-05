Cypress.Commands.add(`openTaxoBl`, (scopeElement, url) => {
    cy.task("systemLog", `Taxonomy ${scopeElement}`);
    cy.visit(url, {timeout: 60000});
    if (scopeElement.includes(`embedded`)) {
        // use scrollTo to trigger lazy load and wait other js ...
        cy.scrollTo('bottom', { ensureScrollable: false, easing: 'linear', duration: 500, force: true });
        cy.wait(5500);
        cy.scrollTo('top', { ensureScrollable: false, easing: 'linear', duration: 2500, force: true });
    }
});

Cypress.Commands.add("getDADJsonExcel", (argFeature, argSelector, argStaticLabel, callback) => {
    let currentUrl = "";
    const staticLabelList = argStaticLabel;
    const tempJsonRes = [];
    cy.url().then($url =>{
        currentUrl = $url;
    });
    cy.task("systemLog", `get data action detail for ${argSelector} | ${currentUrl}`);
    cy.get(`${argSelector} [data-action-detail]`, {timeout: 15000}).then((dataActionObj) => {
        const dataActionElement = dataActionObj;
        for (let tempElement = 0; tempElement < dataActionElement.length; tempElement++) {
            if (!dataActionElement[tempElement].outerHTML.includes("display:none")) {
                const tempClassName = dataActionElement[tempElement].className;
                if (!tempClassName.includes("event_share") && !tempClassName.includes("event_social")) {
                    const tempEventAction = dataActionElement[tempElement].dataset.actionDetail;
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
                        for(const temp of staticLabelList){
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
                    const getEventNameRes = getEventName();
                    const genericAndStaticLabel = [
                        getStaticAndGenericLabel(),
                        getStaticAndGenericLabel(1)
                    ];
                    tempJsonRes.push({
                        "feature": argFeature,
                        "url": currentUrl,
                        "data-action-detail": tempEventAction,
                        "event name": getEventNameRes,
                        "static label":  genericAndStaticLabel[0],
                        "generic label":  genericAndStaticLabel[1]
                    });
                }
            }
        }
        callback(tempJsonRes);
    });
});