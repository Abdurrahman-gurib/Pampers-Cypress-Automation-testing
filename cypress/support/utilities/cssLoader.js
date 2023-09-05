const pampersCrmData = require('../../fixtures/cssSelector/pampersCrm.selectors.json');
const datalayerData = require ('../../fixtures/cssSelector/datalayerValues.json');
const appProperties = require('../../fixtures/app.properties.json');
const pampersUrls = require(`../../fixtures/testProperties/pampersUrls.properties.json`);

globalThis.params = {
  "pampersCrm": pampersCrmData,
  "datalayerValues": datalayerData,
  "appProperties": appProperties,
  "pampersUrls": pampersUrls,
  "garbage": {}
};
