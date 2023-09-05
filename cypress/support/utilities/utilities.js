exports.systemLog = (argLog) => {
    console.log(`[${process.env.npm_package_name}][${new Date().toISOString()}][log]:: ${argLog}`);
}

exports.generateTable = (argLog) => { console.table(argLog); }

exports.generateRandomText = () => {
    const baseChar = Array.from("qwertyuiop");
    let result = "";
    const timestampAsArrayChar = Array.from((new Date().getTime()).toString());
    timestampAsArrayChar.forEach((elementId) => {
        result += baseChar[elementId];
    });
    return result;
}

exports.generateDateForCalendar = () => {
    const dte = new Date().getDate().toString();
    return `(//div[contains(@class,'react-datepicker__day--${(dte.length === 1 ) ?  "00" + dte : "0" + dte}')])[1]`;
}

/**
 * 
 * @param argCrmAction 
 * @returns 
 */
exports.getCrmMarketsScope = (argCrmAction) => {
    return (typeof(argCrmAction.scope) === "string" && argCrmAction.scope === "*"
        ? Object.getOwnPropertyNames(argCrmAction.properties)
        : argCrmAction.scope)
}

// when free! rework above for crm.
exports.getMarketsScope = (argProperties, argSpecificPropertyName) => {
    return (typeof(argProperties.scope) === "string" && argProperties.scope === "*"
        ? Object.getOwnPropertyNames(argProperties[argSpecificPropertyName ? argSpecificPropertyName : "markets"])
        : argProperties.scope)
}