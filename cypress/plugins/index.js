/// <reference types="cypress" />
// ***********************************************************
// This example plugins/index.js can be used to load plugins
//
// You can change the location of this file or turn off loading
// the plugins file with the 'pluginsFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/plugins-guide
// ***********************************************************

// This function is called when a project is opened or re-opened (e.g. due to
// the project's config changing)

/**
 * @type {Cypress.PluginConfig}
 */

const fs = require('fs');
const PNG = require('pngjs').PNG;
const pixelmatch = require('pixelmatch');
const axeDevToolsPlugin = require('@axe-devtools/cypress/dist/plugin');

const { systemLog, generateTable } = require('../support/utilities/utilities');
const { MSTeamNotification } = require('./MSTeamNotification');

// delete all folders
const deleteFolderRecursive = (path) => {
  if (fs.existsSync(path)) {
    fs.readdirSync(path).forEach(function (file, index) {
      var curPath = path + "/" + file;
      if (fs.lstatSync(curPath).isDirectory()) { // recurse
        deleteFolderRecursive(curPath);
      } else { // delete file
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(path);
  }
}

module.exports = (on, config) => {
  on('before:run', (details) => {
      // set global viewport
      // easter egg here run build for ja-JP on VSCode terminal when tuesday
      const welcomeText = fs.readFileSync(
        `./${(new Date().getDay() === 2 && process.env.npm_package_config_market === `ja-JP` ? "data-key" : "welcome")}.txt`,
        "utf8");
      const configInfo = 
        `\nCypress Version :: ${details.config.version}`
        + `\nOS :: ${details.system.osName} ${details.system.osVersion}`
        + `\nBrower :: ${details.browser.displayName} ${details.browser.version}`
          + ` ${details.browser.isHeadless ? "Headless" : "Headed"}`
        + `\nRetries :: ${details.config.retries}`
        + `\nSpec :: ${JSON.stringify(details.specPattern)}`;
      systemLog(`\n${welcomeText}\n\n${configInfo}`);
  });
  on('after:spec', (spec, results) => {
    const appProperties = require('../fixtures/app.properties.json');
    const MSTeamConfig = appProperties.MSTeam;
    let errorMessage = {
      "status": false,
      "data": null
    };
    if (results && results.stats.failures && MSTeamConfig.activate) {
      for (const tempTestStepObj of results.tests) {
        if (tempTestStepObj.state === "failed") {
          errorMessage.status = true;
          errorMessage.data = {
            title: `[PAMPERS][Test Automation Error]`,
            content: `\n\n-- Spec :: ${results.spec.name}\n\n`
              + `-- Step :: ${tempTestStepObj.title[1] || "N/A"}\n\n`
              + `-- Message :: ${tempTestStepObj.displayError}\n\n`
              + `-- User :: ${require("os").userInfo().username}`
          };
          break;
        }
      }
      if (errorMessage.status) { new MSTeamNotification(MSTeamConfig.url, errorMessage.data).sendMessage(); }
      return new Promise((resolve) => {
        setTimeout(() => {
          systemLog(`wait after spec`);
          resolve();
        }, errorMessage.status ? 3000 : 0);
      });
    }
  });
  on("task", {
    systemLog: (argData) => {
      systemLog(argData);
      return null;
    }
  });
  on("task", {
    generateTable: (argData) => {
      generateTable(argData);
      return null;
    }
  });
  on("task", {
    pixelMatch: (argPngPath) => {
      try {
        const path = argPngPath.split(`|`)[0]; const fileName = argPngPath.split(`|`)[1];
        systemLog(`load ${fileName}.png`);
        const img1 = PNG.sync.read(fs.readFileSync(`${path}/base/${fileName}.png`));
        const img2 = PNG.sync.read(fs.readFileSync(`${path}/compare/${fileName}.png`));
        const {width, height} = img1;
        const diff = new PNG({width, height}); let err = false;
        systemLog(`Compare ${img1.width}x${img1.height} with ${img2.width}x${img2.height}`);
        const result = pixelmatch(img1.data, img2.data, diff.data, width, height, {threshold: 0.1});
        if (result && 0.5 < ((result * 100) / (width * height))) {
          systemLog(`diff ${result} pixels`);
          !fs.existsSync(`${path}/result`) && fs.mkdirSync(`${path}/result`);
          fs.writeFileSync(`${path}/result/${fileName}.png`, PNG.sync.write(diff));
          err = true;
        }
        return {"err": err, "res": result};
      } catch (ex) {
        systemLog(`unable to compare A.size != B.size`);
        return {"err": true, "res": "unable to compare! please check the image size for A and B."}; 
      }
    }
  });
  // legacy code starting here!
  // `on` is used to hook into various events Cypress emits
  // `config` is the resolved Cypress config
  const configOverride = {};

  // axeDevTools for accessibility
  axeDevToolsPlugin(on);
  
  deleteFolderRecursive('./cypress/results')
  return Object.assign({}, config, configOverride);
  //return config;
}
