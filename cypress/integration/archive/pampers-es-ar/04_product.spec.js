/// <reference types="Cypress" />

const productProperties = require('../../fixtures/testProperties/product.properties.json');
const productSelector = require('../../fixtures/cssSelector/product.selectors.json');
const { getMarketsScope } = require('../../support/utilities/utilities');

['es-AR'].forEach(scopeElement => {
    const baseUrl = globalThis.params.pampersUrls[productProperties.env][scopeElement];
    const marketProperties = productProperties.markets[scopeElement];
    const detailPageProperties = marketProperties.detailPage;   
    describe(`[Pampers ${scopeElement}][Product LP]`, () => {
        if (marketProperties.bsod) {
            (Object.getOwnPropertyNames(marketProperties.bsod)).forEach(bsodElement => {
                it (`[BSOD][open ${bsodElement} and verify filter is auto selected]`, () => {
                    cy.productLpBSOD(baseUrl, marketProperties, productSelector, bsodElement);
                });
            });
        }
        it (`[Open Product LP]`, () => {
            cy.productLpOpen(baseUrl, marketProperties);
        });
        it (`[Scroll footer -> header to activate all components]`, () => {
           cy.productLpScrollIntoView();
        });
        productSelector.productLP.elementsShouldBeVisible.forEach(elVisible => {
            it (`[Product landing page][Verify ${elVisible} is visible]`, () => {
                cy.productLpElementShouldBeVisible(elVisible);
            })
        });
        productSelector.productLP.filterTest.forEach(elFilter => {
            it (`[Product landing page][filter][click on ${elFilter}]`, () => {
                cy.productLpFilterElements(elFilter);
            })
        });
        if (marketProperties.diaperSizeCalculator) {
            it (`[Diaper Size Calculator][Verify user can select value and result section appears]`, () => {
                cy.productLpDpSizeCalculator(productSelector, marketProperties);
            });
        }
        it (`[Verify SEO text is not empty]`, () => {
            cy.productLpSEO(productSelector.productLP.seo);
        });
        if (marketProperties.comparativeTable) {
            it (`[Comparative Table][Open - verify elements - close]`, () => {
                cy.productLpComparativeTable(productSelector.productLP.comparativeTable, marketProperties.comparativeTable);
            });
        }
        if (marketProperties.BIN) {
            it (`[BIN][Popin appears and product img is present]`, () => {
                cy.productLpBin(marketProperties.BIN, productSelector.productLP.BIN);
            });
        }
    });
    if (detailPageProperties) {
        Object.getOwnPropertyNames(detailPageProperties.path).forEach(pathElement => {
            const runReviewPopin = !detailPageProperties.doNotVerify
                ? true : detailPageProperties.doNotVerify.includes("writeReviewPopin")
                    ? false : true;
            describe(`[Pampers ${scopeElement}][Product ${pathElement}]`, () => {
                if (!marketProperties.loggedUser){
                    before(() => {
                        cy.clearCookies();
                        cy.clearLocalStorage();
                    });
                }
                it (`[Open Product ${pathElement}]`, () => {
                    cy.productDpOpen(`${baseUrl}/${detailPageProperties.path[pathElement]}`,
                        (marketProperties.BIN && marketProperties.BIN.banner) ? marketProperties.BIN.banner : null);
                });
                if (detailPageProperties.shopNow) {
                    it (`[Verify Product ${pathElement} BIN btn is present and use the right color / text]`, () => {
                        cy.productDpVerifyBinBtn(
                            productSelector.detailPage.binType[marketProperties.BIN.type],
                            detailPageProperties.shopNow,
                            productSelector.detailPage.common.shopNow,
                            productSelector.detailPage[pathElement].binColor);
                    });
                }
                Object.getOwnPropertyNames(productSelector.detailPage.common).forEach(propertiesEl => {
                    const verifyCurrentElement = !detailPageProperties.doNotVerify
                        ? true : detailPageProperties.doNotVerify.includes(propertiesEl)
                            ? false : true;
                    if (verifyCurrentElement) {
                        it (`[Verify page elements are present][${propertiesEl}]`, () => {
                            cy.productDpVerifyElementIsVisible(productSelector.detailPage.common[propertiesEl]);
                        });
                    }
                });
                if (pathElement === `oasis` && detailPageProperties.embeddedTool) {
                    it (`[Verify Diaper Size Calculator is present]`, () => {
                        cy.productDpEmbeddedDiaperSizeCalculator(productSelector.detailPage.oasis.embeddedTool);
                    });
                }
                if (runReviewPopin && !marketProperties.loggedUser) {
                    it (`[Verify user can log IN from product ${pathElement} cta]`, () => {
                        cy.productDpCtaLogin(productSelector.detailPage.common.writeReviewCta, scopeElement);
                        // we need to wait before next step, even element can be present
                        // we want to avoid navigation err when opening review popin
                        cy.wait(7500);
                    });
                    it (`[Open Write a review popin]`, () => {
                        cy.genericClickOrType(productSelector.detailPage.common.writeReviewCta);
                    });
                    Object.getOwnPropertyNames(productSelector.detailPage.writeReviewPopin).forEach(reviewElement => {
                        const verifyCurrentElement = !detailPageProperties.doNotVerify
                            ? true : detailPageProperties.doNotVerify.includes(reviewElement)
                                ? false : true;
                        if (verifyCurrentElement) {
                            it (`[Verify Review popin element][${reviewElement}]`, () => {
                                cy.productDpVerifyElementIsVisible(productSelector.detailPage.writeReviewPopin[reviewElement]);
                            });
                        }
                    });
                    it (`[User can close Write a review popin]`, () => {
                        cy.genericClickOrType(productSelector.detailPage.writeReviewPopin.close);
                    });
                }
            });
        });
    }
});