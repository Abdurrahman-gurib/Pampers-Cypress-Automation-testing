import { test } from '@playwright/test';
import * as fs from "fs";
import { systemLog } from '../utilities/util';

const configNoindex: any = JSON.parse(fs.readFileSync("./playwright/config/noindex.properties.json", "utf8"));
const configDataSource: string = configNoindex.defaultDatasource;
const configNoIndexIsPresent: boolean = configNoindex[configDataSource].isNoIndexShouldBePresent;

const noindexScope: Array<string> = configNoindex.scope === `*` ?
  Object.getOwnPropertyNames(configNoindex[configDataSource].market) :
  configNoindex.scope;

  /**
   * open each Url in scope and 
   * - check status code => FAIL if 404
   * - check responseHeader => FAIL if contains x-robots-tag=noindex
   * - check HTML meta => FAIL if contains meta[name=`robots`][content=`noindex`]
   */
test.describe(`Noindex scan`, () => {
  noindexScope.forEach(elementMarketInScope => {
    (configNoindex[configDataSource].market[elementMarketInScope]).forEach(elementUrlToScan => {
      test(`scan ${elementUrlToScan}`, async ({ page }) => {
        
        const responseObj: any = page.waitForResponse(elementUrlToScan);
        await page.goto(elementUrlToScan);

        const pageResponse: any = await responseObj;
        const isStatusCode404: boolean = (pageResponse?._initializer?.status === 404) ? true : false;

        const responseHeaderOrHtmlContainsNoIndex: boolean = 
          await page.locator(`meta[name="robots"][content="noindex"]`).count() ? true : 
          ((pageResponse?._initializer?.headers).find(elementToFind => elementToFind.name === `x-robots-tag` && elementToFind.value === `noindex`))
            ? true : false ;

        systemLog(`${elementMarketInScope} | ${elementUrlToScan} | ${isStatusCode404  ? '\x1b[31m[ERROR] ' : '\x1b[0m'}status code 404 ${isStatusCode404}\x1b[0m`
        + ` | ${responseHeaderOrHtmlContainsNoIndex !== configNoIndexIsPresent ? '\x1b[31m[ERROR]' : '\x1b[0m'}`
        + ` noindex is present "${responseHeaderOrHtmlContainsNoIndex}" and we expect "${configNoIndexIsPresent}"`);

        test.fail((isStatusCode404 || responseHeaderOrHtmlContainsNoIndex !== configNoIndexIsPresent), `Err on ${elementUrlToScan} pls check log`);

      });
    });
  });
})