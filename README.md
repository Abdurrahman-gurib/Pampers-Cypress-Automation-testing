# cyprox

Cyprox is a automation app based on cypress (^7.3.0).

## Git Repo

Master, develop, Sprint and Hotfix are protected. Please click [here](https://gitlab.com/hangarwww/qa/-/wikis/uploads/9dec252d93869a4c93839e96b2f49c3c/gitArchitecture.PNG) to see more about our Git branch structure.

Note : [Here](https://hangarwww.gitlab.io/qa/) a "how to" if you want to add your ssh key.

## Architecture

 - Cypress configuration : cypress.json | please ref to [cypress official doc](https://docs.cypress.io/guides/references/configuration#cypress-json).
 - Test automation script : cypress > integration | contains scripts and each script is a test.
 - Test Properties : cypress > fixtures | here we save urls, css selector, ...

For dependencies, please refer to [cypress - npm](https://www.npmjs.com/package/cypress) > Dependencies tab and below our dev dependencies :

```
"devDependencies": {
    "cypress": "^7.3.0",
    "cypress-mochawesome-reporter": "^1.3.0"
  },
```

## Install Cyprox

- [ ] Please click [here](https://docs.cypress.io/guides/getting-started/installing-cypress#npm-install) to install cypress.
- [ ] Use ```npm i``` in root folder to install node_modules.

## RUN Cyprox

To run Cyprox, you can use :

- [ ] Runners in cypress > runner.
- [ ] Terminal with ```npx cypress run --spec 'cypress/integration%HERE YOUR SCRIPT%/*' --browser chrome```
- [ ] Scripts in root/package.json > scripts

## Change log

- V1.1.0 :

```
New : 
Taxonomy
Taxonomy generic test.
wiki => https://gitlab.com/qahangarww/cyprox/-/wikis/sprint/taxonomy

MS Teams Notification
Send Microsoft Teams Notification in case of failures (real time notification).
Wiki => https://gitlab.com/qahangarww/cyprox/-/wikis/sprint/MSTeam-Notificaiton

optid Checker
Cypress custom command to check optId in registration payload
wiki => https://gitlab.com/qahangarww/cyprox/-/wikis/sprint/optid-checker

PGDataLayer
Cross check dataLayer values on US-en homepage.
Wiki => https://gitlab.com/qahangarww/cyprox/-/wikis/sprint/PGDataLayer

Optimization :
generic Registration Form
Cypress custom command for registration form.
wiki => https://gitlab.com/qahangarww/cyprox/-/wikis/sprint/cssSelectorLoader-and-custom-command-%22genericRegistrationForm%22

cypress-xpath
cypress-xpath library has been added in package.json to be able to use xpath.
doc => https://github.com/cypress-io/cypress-xpath#readme

Headleass log
Custom task has been added to be able to track cypress in headless mode.
cy.task("systemLog", "%STRING%");

Fix and Maintenance :
Selector Maintenance
CSS Selector maintenance after Taxonomy Phase 3 release
legacy script is based on DAD (data-action-detail)
```


#   P a m p e r s - C y p r e s s - A u t o m a t i o n - t e s t i n g  
 #   P a m p e r s - C y p r e s s - A u t o m a t i o n - t e s t i n g  
 #   P a m p e r s - C y p r e s s - A u t o m a t i o n - t e s t i n g  
 #   P a m p e r s - C y p r e s s - A u t o m a t i o n - t e s t i n g  
 