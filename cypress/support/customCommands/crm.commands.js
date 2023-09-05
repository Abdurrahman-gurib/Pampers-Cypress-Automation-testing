const getDateInputFormat = (argSelector, callback) => {
    const result = [];
    for (let compt = 1; compt < 4; compt++) {
        cy.xpath((argSelector).replace(`%ID%`, compt)).invoke(`attr`, `name`).then($inputNameValue => {
            cy.task(`systemLog`, `get react cal date format for ${compt} input -> ${$inputNameValue}`);
            switch($inputNameValue) {
                case "day":
                    result.push("dd");
                    break;
                case "month":
                    result.push("mm");
                    break;
                case "year":
                    result.push("yyyy");
                    break;
                default:
                    break;
            }
            if (compt === 3) { callback(result.join("/")); }
        });
    }
}

Cypress.Commands.add("genericRegistrationForm", (argArrayFieldsList, argMarketSpecification, argMarketConfig) => {
    cy.log(`generic registration form`);
    // load cssSelector, properties and actionConfig
    const arrayFieldsListFromTestScript = argArrayFieldsList;
    const pampersCrm = globalThis.params.pampersCrm;
    const getEmailPattern = pampersCrm.properties.email.split("%generic%");
    const genericEmailAddress = getEmailPattern[0] + new Date().getTime() + getEmailPattern[1];
    const actionListFromActionConfig = Object.getOwnPropertyNames(pampersCrm.actionConfig);
    const objAction = {};
    // before start filling the form, save the react cal date format dd/mm/yyyy
    globalThis.params.garbage.crmMarketCulture = argMarketSpecification;
    getDateInputFormat(pampersCrm.registration.calDateFormat, (dateInputFormat) => {
        globalThis.params.garbage.registrationCalDateFormat = dateInputFormat;
        cy.task(`systemLog`, `date format for registration page ${globalThis.params.garbage.registrationCalDateFormat}`);
    });
    // click in any field first then start to complete form
    cy.get(pampersCrm.registration.email).click({force: true});
    // standard fields => firstname, email, password. Child dob not applicable due to areYouParent element
    if (!argArrayFieldsList.includes("noFirstName")) {
        cy.get(pampersCrm.registration.firstName).type(pampersCrm.properties.firstName, {force: true});
    }
    cy.get(pampersCrm.registration.email).type(genericEmailAddress, {force: true});
    cy.get(pampersCrm.registration.password).type(pampersCrm.properties.password, {force: true});
    ////////////// IF GDPR! //////////////
    if (arrayFieldsListFromTestScript && arrayFieldsListFromTestScript.includes("gdpr")) {
        cy.get(pampersCrm.registration.gdpr).click({ force: true});
        arrayFieldsListFromTestScript.splice(arrayFieldsListFromTestScript.indexOf("gdpr"), 1);
    } else {
        ////////////// START YES PARENT //////////////
        // if areYouParent is present, click on yes before child dob
        if (arrayFieldsListFromTestScript && arrayFieldsListFromTestScript.includes("areYouParent")) {
            cy.get(pampersCrm.registration.areYouParent).click({ force: true, multiple: true });
            const tempIndexOfArg = arrayFieldsListFromTestScript.indexOf("areYouParent");
            arrayFieldsListFromTestScript.splice(tempIndexOfArg, 1);
        }
        cy.get(pampersCrm.registration.reactCalendarIcon, { timeout: 1000 }).click({force: true});
        (pampersCrm.registration.selectDateInReactCalendar.includes("//"))
            ? cy.xpath(pampersCrm.registration.selectDateInReactCalendar, { timeout: 1000 }).click({force: true})
            : cy.get(pampersCrm.registration.selectDateInReactCalendar, { timeout: 1000 }).click({force: true});
        ////////////// END YES PARENT //////////////
    }
    // now let's start to work on specific fields...
    // start by findy element to click / type
    if (arrayFieldsListFromTestScript){
        actionListFromActionConfig.forEach((element) => {
            objAction[element]=[];
            for (const tempElementForAction of pampersCrm.actionConfig[element]) {
                for (const tempElementFromTestScript of arrayFieldsListFromTestScript) {
                    if (tempElementForAction === tempElementFromTestScript) {
                        objAction[element].push(tempElementFromTestScript);
                        const tempIndexOfArg = arrayFieldsListFromTestScript.indexOf(tempElementFromTestScript);
                        arrayFieldsListFromTestScript.splice(tempIndexOfArg, 1);
                    }
                }
            }
        });
        // now let's finish registration
        const listOfActionToPerform = Object.getOwnPropertyNames(objAction);
        const getValueToType = (argTempCssSelectorElement) => {
            const generateValue = (argValue) => {
                let res = argValue;
                if (argValue.includes("%genericNumber%")) {
                    const tempId = new Date().getTime().toString();
                    res = `${argValue.split("%genericNumber%")[0]}${argValue.includes("|") ? tempId.slice(0, argValue.split(`|`)[1]) : tempId}`;
                }
                return res;
            };
            return (argMarketSpecification && pampersCrm.marketSpecification[argTempCssSelectorElement] && pampersCrm.marketSpecification[argTempCssSelectorElement][argMarketSpecification])
                ? generateValue(pampersCrm.marketSpecification[argTempCssSelectorElement][argMarketSpecification])
                : pampersCrm.properties[argTempCssSelectorElement];
        };
        listOfActionToPerform.forEach((elementActionToPerform) => {
            for (const tempCssSelectorElement of objAction[elementActionToPerform]) {
                let tempValueToType = null;
                switch(elementActionToPerform) {
                    case "type":
                        tempValueToType = getValueToType(tempCssSelectorElement);
                        cy.task(`systemLog`, `type ${tempValueToType} in ${pampersCrm.registration[tempCssSelectorElement]}`);
                        cy.get(pampersCrm.registration[tempCssSelectorElement]).type(tempValueToType, {force: true});
                        break;
                    case "click":
                        cy.task(`systemLog`, `click ${pampersCrm.registration[tempCssSelectorElement]}`);
                        cy.get(pampersCrm.registration[tempCssSelectorElement], { timeout: 500 }).click({force: true});
                        break;
                    case "verifyIsPresent":
                        cy.task(`systemLog`, `verify ${pampersCrm.registration[tempCssSelectorElement]} is visible`);
                        cy.get(pampersCrm.registration[tempCssSelectorElement]).should("be.visible");
                        break;
                    case "select":
                        const tempSelectValue = (pampersCrm.registration[tempCssSelectorElement]).split("|");
                        cy.task(`systemLog`, `select ${tempSelectValue[0]} => ${tempSelectValue[1]}`);
                        cy.get(tempSelectValue[0]).select(tempSelectValue[1]);
                        break;
                    default:
                        break;
                }
                if (tempCssSelectorElement === `phoneNumber`) {
                    globalThis.params.garbage.tempPhoneNumber = tempValueToType;
                    cy.task(`systemLog`, `garbage phone number ${globalThis.params.garbage.tempPhoneNumber}`);
                }
            }
        });
    }
    globalThis.params.garbage.tempEmailAddress = genericEmailAddress;
    cy.task(`systemLog`, `garbage phone number ${globalThis.params.garbage.tempEmailAddress}`);
    cy.intercept("POST", "crm/api/crm").as("crm");
    // sometimes we need to click 2x on submit btn
    cy.get(pampersCrm.registration.submitRegistrationFormBtn).click({force: true}).then(() => {
        if (!argMarketConfig?.dontCheckLoaderAndClickAgain) {
            cy.task(`systemLog`, `check if loader is not present -> to click on submit again`);
            cy.wait(5000);
            cy.get(`body`).then($el => {
                if (!$el[0].outerHTML.includes(`loading`)) {
                    cy.task(`systemLog`, `click on submit again!`);
                    cy.get(pampersCrm.registration.submitRegistrationFormBtn).click({force: true});
                }
            });
        }
    });
});

Cypress.Commands.add("optIdChecker", (market, argGlobalOpt_initialoptStatus) => {
    cy.log("OptID Checker");
    const optId = globalThis.params.pampersCrm.otherCrmPropertiess[market].optid;
    cy.wait("@crm").then((interception) => {
      const requestBody = interception.request.body;
      if (requestBody.Params.globalOpt_optId !== optId && requestBody.Params.globalOpt_initialoptStatus != argGlobalOpt_initialoptStatus) {
        throw new Error (`optID expected ${optId}, actual ${requestBody.Params.globalOpt_optId}`);
      }
    });
});

Cypress.Commands.add("checkPostalCodeRegex", (argPostalCode) => {
    cy.task("systemLog", `check postal code regex with ${argPostalCode} digits`);
    cy.wait(10000);
    cy.get(`div[class="your-address-section"] h2`, {timeout: 15000}).click().then(() => {
        cy.get(`input[name="addressPostalCode"]`, {timeout: 10000}).scrollIntoView();
        cy.get(`input[name="addressPostalCode"]`).clear().then(() => {
            cy.task("systemLog", `check postal code regex with special char`);
            cy.get(`input[name="addressPostalCode"]`).type(`0+#$@!A%%`, {force: true});
            cy.wait(1000);
            cy.get(`input[name="addressPostalCode"]`).clear();
        });
        let tempId = 0;
        while (tempId < argPostalCode.length) {
            cy.task("systemLog", `check postal code regex type #${tempId+1} char`);
            const spanClass= (tempId !== ((argPostalCode.length) - 1))
                ? "form-field-error-message" : "sr-only";
            cy.get(`input[name="addressPostalCode"]`).type(argPostalCode.split("")[tempId], {force: true});
            cy.get(`input[name="addressStreet1"]`).click();
            cy.wait(1000);
            cy.xpath(`//span[@id="addressPostalCode"]`).should("have.attr", "class").and("include", spanClass);
            tempId++;
        }
    });
});

Cypress.Commands.add("checkDateFormat", (argDateFormat) => {
    // anagram 3! (m, d, y) = 6 => dmy dym ydm ymd mdy myd
    // mdy => month day year, dmy => day month year, ...
    cy.task("systemLog", `check date format for ${argDateFormat}`);
    cy.wait(7500);
    const dteFormat = globalThis.params.pampersCrm.otherCrmPropertiess[argDateFormat].dteFormat.split("/");
    cy.task("systemLog", `date format ${dteFormat}`);
    // check d m y
    const checkDateFormat = (argSection) => {
        cy.xpath(`${argSection}[1]`).should(`have.attr`, `placeholder`).and(`include`, dteFormat[0]);
        cy.xpath(`${argSection}[2]`).should(`have.attr`, `placeholder`).and(`include`, dteFormat[1]);
        cy.xpath(`${argSection}[3]`).should(`have.attr`, `placeholder`).and(`include`, dteFormat[2]);
    };
    // date format in about you section
    cy.get(`div[class="about-you-section"] h2`, {timeout: 15000}).click().then(() => {
        cy.task("systemLog", `date format for about you section`);
            checkDateFormat(`(//div[@class="about-you-section"]//div[@class='date-input-inner-container']//input)`);
    });
    // date format in child section
    cy.get(`div[class="your-baby-section"] h2`, {timeout: 15000}).click().then(() => {
        cy.get(`button[class="add-baby-btn"]`, {timeout: 5000}).click().then(() => {
            cy.task("systemLog", `date format for your baby section`);
            checkDateFormat(`(//form[@class="add-child-form  "]//div[@class='date-input-inner-container']//input)`);
        });
    });
});

Cypress.Commands.add(`postRegCheckCancelAndSaveProfile`, (argCrmSelector) => {
    // another one :D from audit
    // check date format
    // date format from registration page = from edit profile = from properties
    if (globalThis.params.garbage.registrationCalDateFormat) {
        let properties = require('../../fixtures/testProperties/crm.properties.json');
        const marketCulture = globalThis.params.garbage.crmMarketCulture;
        const regDateFormat = globalThis.params.garbage.registrationCalDateFormat;
        cy.task(`systemLog`, `check if ${marketCulture} use the correct date format, globalThis.params for REG ${regDateFormat}`);
        const propDateFormat = properties?.registration?.properties[marketCulture]?.dateFormat || null ;
        // release memories... dont need it more.
        properties = null;
        if (propDateFormat) {
            cy.task(`systemLog`, `start comparaison date format`);
            getDateInputFormat(globalThis.params.pampersCrm.registration.calDateFormat, (dateInputFormat) => {
                cy.task(`systemLog`, `date format on edit profile ${dateInputFormat}`);
                if (regDateFormat === dateInputFormat && dateInputFormat === propDateFormat) {
                    cy.task(`systemLog`, `date format ${propDateFormat} is the correct one for current market`);
                } else {
                    throw new Error(`wrong date format for market ${marketCulture},`
                        + ` expected ${propDateFormat}, actual on REG ${regDateFormat}, actual on edit profile ${dateInputFormat}`);
                }
            });
        } else { throw new Error(`unable to test date format due to propDateFormat NULL`);}
        globalThis.params.garbage.registrationCalDateFormat = null;
        globalThis.params.garbage.crmMarketCulture = null;
    }
    // QA audit issue
    // complete user DOB post REG
    cy.task(`systemLog`, `check flow cancel then save firstname post reg`);
    const { generateDateForCalendar, generateRandomText } = require('../../support/utilities/utilities');
    const waitPageReloadAndUpdateFirstname = (argOpenSection) => {
        cy.wait(5500);
        if (argOpenSection) {
            cy.wait(10000);
            cy.get(argCrmSelector.aboutYouSection).click({force: true});
        }
        cy.get(argCrmSelector.aboutYouFirstname).type(generateRandomText(), {force: true});
        cy.get(argCrmSelector.aboutYouCal).click({force: true});
        cy.wait(1500);
    };
    // rec fn to click on previous until eligible year
    const eligibleYearValue = new Date().getFullYear() - 22;
    const goToEligibleYear = () => {
        cy.get(argCrmSelector.reactCalTitleSection).then(($value) => {
            const currentCalTitle = $value.text();
            if (!currentCalTitle.includes(eligibleYearValue)) {
                cy.get(argCrmSelector.reactCalPrevious).click({force: true});
                goToEligibleYear();
            }
        });
    };
    cy.get(argCrmSelector.aboutYouCal).click({force: true});
    goToEligibleYear();
    cy.wait(500);
    cy.xpath(generateDateForCalendar()).click({force: true});
    cy.wait(500);
    cy.get(argCrmSelector.aboutYouFirstname).click({force: true});
    cy.get(argCrmSelector.saveBtn).click({force: true});
    // modify firstname and cancel
    // after page refresh -> update firstname and save
    waitPageReloadAndUpdateFirstname();
    cy.get(argCrmSelector.cancelBtn).click({force: true});
    // after page refresh -> update firstname and save
    waitPageReloadAndUpdateFirstname(true);
    cy.get(argCrmSelector.saveBtn).click({force: true});
    // wait 7.5s to see if there is any issue related to previous snow ticket
    // about error page displayed for this specific scenario
    cy.wait(7500);
    cy.get(argCrmSelector.aboutYouSection).should(`be.visible`);
});

Cypress.Commands.add("gdprEditProfileNoBaby", () => {
    const editProfileSelectors = globalThis.params.pampersCrm.editProfile;
    cy.get(editProfileSelectors.childSection, {timeout: 15000}).click({force: true});
    cy.wait(1500);
    cy.get(editProfileSelectors.childCard).should(`not.exist`);
});

Cypress.Commands.add("editProfileLastName", (argCrmSelector, argTextForFirstName, argIsUpdateField, argMarket) => {
    const lastNameSelector = argCrmSelector.editProfile.specificConfig[argMarket]?.lastName || argCrmSelector.registration.lastName;
    if (argIsUpdateField) {
        cy.task("systemLog", `update last name ${argTextForFirstName}`);
        cy.get(argCrmSelector.editProfile.aboutYouSection, {timeout: 5000}).click({force: true});
        cy.get(lastNameSelector).clear({force: true}).then(() => {
            cy.get(lastNameSelector).type(argTextForFirstName, {force: true});
        });
    } else {
        cy.task("systemLog", `verify new last name ${argTextForFirstName} is visible`);
        cy.wait(7500);
        cy.get(lastNameSelector, {timeout: 2500}).should(`have.attr`, `value`)
            .and("include", argTextForFirstName);
    }
});

Cypress.Commands.add("editProfileChild", (argCrmSelector, argTextForChildName, argIsAddChild) => {
    if (argIsAddChild) {
        cy.task(`systemLog`, `open child section ${argTextForChildName}`);
        cy.get(argCrmSelector.editProfile.childSection).click({force: true}).then(() => {
            cy.wait(500);
            cy.task(`systemLog`, `click on add child`);
            cy.get(argCrmSelector.editProfile.addChildBtn, {timeout: 1000}).click({force: true});
            cy.task(`systemLog`, `add child ${argTextForChildName}`);
            cy.get(argCrmSelector.editProfile.newChildFirstName).type(argTextForChildName, {force: true});
            cy.get(argCrmSelector.editProfile.newChildCalendar).click({force: true});
            cy.xpath(argCrmSelector.registration.selectDateInReactCalendar, {timeout: 1500}).click({force: true});
            cy.get(argCrmSelector.editProfile.newChildGender).click({force: true});
        });
    } else {
        const buildXpathForNewChild = argCrmSelector.editProfile.removeNewChildBtn.replace("%GENERICNAME%", argTextForChildName);
        cy.task(`systemLog`, `remove child ${buildXpathForNewChild}`);
        cy.xpath(buildXpathForNewChild, {timeout: 1500}).click({force: true});
    }
});

Cypress.Commands.add("editProfileAddress", (argCrmSelector, argTextForAddress, argIsFirstType) => {
    if (argIsFirstType) {
        cy.task(`systemLog`, `add new address ${argTextForAddress}`);
        cy.get(argCrmSelector.editProfile.yourAddressSection).click({force: true}).then(() => {
            cy.wait(500);
            cy.task(`systemLog`, `clear current address`);
            cy.get(argCrmSelector.registration.streetAddress1, {timeout: 20000}).clear({force: true});
            // wait 1.5s before typing to make sure previous value has been cleared correctly
            cy.wait(1500);
            cy.task(`systemLog`, `add new address`);
            cy.get(argCrmSelector.registration.streetAddress1).type(argTextForAddress, {force: true});
        });
    } else {
        cy.task(`systemLog`, `verify new address is present ${argTextForAddress}`);
        cy.get(argCrmSelector.registration.streetAddress1).should(`have.attr`, "value").and(`include`, argTextForAddress);
    }
});

Cypress.Commands.add("editProfileOptStatus", (argCrmSelector, argIsFirstCheck) => {
    if (argIsFirstCheck) {
        cy.task("systemLog", `open optin section`);
        cy.wait(500);
        cy.get(argCrmSelector.editProfile.optinSection).click({force: true}).then(() => {
            cy.task("systemLog", `uncheck optstatus`);
            cy.get(argCrmSelector.editProfile.optStatus, {timeout: 1000}).uncheck({force: true});
        });
    } else {
        cy.task("systemLog", `check optstatus`);
        cy.get(argCrmSelector.editProfile.optStatus).check({force: true});
    }
});

Cypress.Commands.add(`editProfileSave`, (argCrmSelector) => { 
    cy.task("systemLog", `save profile`);
    cy.get(argCrmSelector.editProfile.saveBtn, {timeout: 1500}).click({force: true});
})

Cypress.Commands.add("logOut", (argAvatarSelector, argLogoutSelector, argTimeOut) => {
    // no way! we need to wait 5.5s since no idea of the js needed for this action
    // to avoid possible err on other market, pls keep the wait below
    //cy.wait(5500);
    //no need to keep this wait 
    const prodApiUrl = globalThis.params.pampersCrm.properties.prodApiUrl;
    cy.task(`systemLog`, `Open profile section in top right`);
    cy.get(argAvatarSelector, {timeout: argTimeOut || 20000}).click({force: true, multiple: true});
    cy.task(`systemLog`, `Click on logout`);
    cy.get(argLogoutSelector, {timeout: argTimeOut || 20000}).click({force: true});
    cy.intercept(`POST`, prodApiUrl).as("crmRevokeToken");
    cy.task(`systemLog`, `check accessToken has been removed`);
    cy.wait("@crmRevokeToken", {timeout: argTimeOut || 10000}).its('response.statusCode').should('eq', 200).then(() => {
        cy.getCookie('accessTokens').should('not.exist');
    });
});