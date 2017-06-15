require('chai').should()

var ExtLocator = require("./ExtJSlocatorHelper.js");

describe("Login to the system", function () {
    it("Login to the system as admin/admin", function () {
        browser.windowHandleMaximize();
        browser.url('/ubadminui');
        browser.waitForExist('//h2');
        var title = browser.getText('//h2');
        title.should.equal('Autotest UB SQLITE');
        console.log('Title is: ' + title);
        browser.setValue(ExtLocator.getCss('textfield[requireText=Користувач]') + '-inputEl', 'admin');
        browser.setValue(ExtLocator.getCss('textfield[inputType=password]') + '-inputEl', 'admin');
        browser.click(ExtLocator.getCss('button[cls=ub-login-btn]'));
        // browser.pause(3000);//temporary solution before bug fixing
        // browser.click('.ub-error-win-btn.ub-error-win-btn-ok'); //temporary solution before bug fixing
        browser.pause(1000)

    });
});

describe("Open 'Test main data'", function () {
    it("Open 'Test main data' on top menu", function () {
        browser.click(ExtLocator.getCss('button[text=Test][ui=default-toolbar-small]'));
        browser.click(ExtLocator.getCss('menuitem[text=tst_maindata]'));
        browser.pause(1000);
    });
    it("Check displayed columns ", function () {
        var tab = browser.getText(ExtLocator.getCss('tab[tooltip=ub test main data]'));
        tab.should.equal('UB TEST MAIN DATA');
        console.log('Tab is ' + tab);
        var tabCode = browser.isExisting('.x-column-header-text=Code');
        tabCode.should.equal(true);
        var tabCaption = browser.isExisting('.x-column-header-text=Caption');
        tabCaption.should.equal(true);
        var tabComplexCaption = browser.isExisting('.x-column-header-text=complexCaption');
        tabComplexCaption.should.equal(true);
        var tabNonNullDictID = browser.isExisting('.x-column-header-text=nonNullDict_ID');
        tabNonNullDictID.should.equal(true);
        var tabEnumValue = browser.isExisting('.x-column-header-text=enumValue');
        tabEnumValue.should.equal(true);
        var DateTimeValue = browser.isExisting('.x-column-header-text=dateTimeValue');
        DateTimeValue.should.equal(true);
        var tabBooleanValue = browser.isExisting('.x-column-header-text=booleanValue');
        tabBooleanValue.should.equal(true);
        var tabTestManyData = browser.isExisting('.x-column-header-text=test many data');
        tabTestManyData.should.equal(true);
        var tabBigInt = browser.isExisting('.x-column-header-text=BigInt');
        tabBigInt.should.equal(true);
        browser.pause(1000);
    })
});
