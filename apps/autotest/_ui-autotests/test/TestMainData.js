require('chai').should()

var ExtLocator = require("./ExtJSlocatorHelper.js");
var newCode = 'Код777';
var engLoc = 'Caption Test ENG';
var uaLoc = 'Caption Test UA';
var complexCaption = "Test complexCaption";

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
    it("Check displayed columns", function () {
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

describe("Open item in Test Main data", function () {
    it("Select item in grid and open tab with edit form of item ", function () {
        var itemInGrid = '//*[@id="' + ExtLocator.getId('ubtableview') + '"]//div[.="Заголовок 100"]';
        browser.doubleClick(itemInGrid);
        browser.pause(3000);
    });
    it("Check opened item in Test Main data", function () {
        var code = browser.isExisting('//*[@id="' + ExtLocator.getId('ubtextfield[attributeName=code]') + '"]');
        code.should.equal(true);
        var caption = browser.isExisting('//*[@id="' + ExtLocator.getId('ubtextfield[attributeName=caption]') + '"]');
        caption.should.equal(true);
        var complexCaption = browser.isExisting('//*[@id="' + ExtLocator.getId('ubtextfield[attributeName=complexCaption]') + '"]');
        complexCaption.should.equal(true);
        var nonNullDictID =browser.isExisting('//*[@id="' + ExtLocator.getId('ubcombobox[attributeName=nonNullDict_ID]') + '"]');
        nonNullDictID.should.equal(true);
        var nullDictID =browser.isExisting('//*[@id="' + ExtLocator.getId('ubcombobox[attributeName=nullDict_ID]') + '"]');
        nullDictID.should.equal(true);
        var parent =browser.isExisting('//*[@id="' + ExtLocator.getId('ubcombobox[attributeName=parent]') + '"]');
        parent.should.equal(true);
        var parent1 =browser.isExisting('//*[@id="' + ExtLocator.getId('ubcombobox[attributeName=parent1]') + '"]');
        parent.should.equal(true);
        var parent1 =browser.isExisting('//*[@id="' + ExtLocator.getId('ubcombobox[attributeName=parent1]') + '"]');
        parent.should.equal(true);
        var enumValue =browser.isExisting('//*[@id="' + ExtLocator.getId('ubbasebox[attributeName=enumValue]') + '"]');
        enumValue.should.equal(true);
        var dateTimeValue =browser.isExisting('//*[@id="' + ExtLocator.getId('ubdatetimefield[attributeName=dateTimeValue]') + '"]');
        dateTimeValue.should.equal(true);
        var booleanValue =browser.isExisting('//*[@id="' + ExtLocator.getId('checkboxfield[attributeName=booleanValue]') + '"]');
        booleanValue.should.equal(true);
        var testManyData =browser.isExisting('//*[@id="' + ExtLocator.getId('ubboxselect[attributeName=manyValue]') + '"]');
        testManyData.should.equal(true);
        var caption10IntestManyData =browser.isExisting('//*[@id="' + ExtLocator.getId('ubboxselect[attributeName=manyValue]') + '"]//div[.="caption 10"]');
        caption10IntestManyData.should.equal(true);
        var caption20IntestManyData =browser.isExisting('//*[@id="' + ExtLocator.getId('ubboxselect[attributeName=manyValue]') + '"]//div[.="caption 20"]');
        caption20IntestManyData.should.equal(true);
        var test2dManyData =browser.isExisting('//*[@id="' + ExtLocator.getId('ubboxselect[attributeName=manyValue2]') + '"]');
        test2dManyData.should.equal(true);
        var bigint =browser.isExisting('//*[@id="' + ExtLocator.getId('numberfield[attributeName=bigintValue]') + '"]');
        bigint.should.equal(true);
        var mappedToSelf =browser.isExisting('//*[@id="' + ExtLocator.getId('ubcombobox[attributeName=mappedToSelf]') + '"]');
        mappedToSelf.should.equal(true);
        browser.click(ExtLocator.getCss("tab[text=ub test main data][active=true]") + '-closeEl');
    });
});

describe("Edit 'Code'", function () {
    it("Select item for editing 'Code' in grid and open tab with edit form of item", function () {
        var itemInGrid = '//*[@id="' + ExtLocator.getId('ubtableview') + '"]//div[.="Код2"]';
        browser.doubleClick(itemInGrid);
        browser.pause(3000);
    });
    it("Get content of the 'Code' text field before editing", function () {
        var textInTextAreaBeforeEditing = browser.getValue(ExtLocator.getCss('ubtextfield[attributeName=code]') + '-inputEl');
        textInTextAreaBeforeEditing.should.equal('Код2');
    });
    it("Edit 'Code' text field", function () {
        browser.setValue((ExtLocator.getCss('ubtextfield[attributeName=code]') + '-inputEl'),newCode);
        browser.click(ExtLocator.getCss('button[cls=save-and-close-action]'));
        browser.pause(1000);
    });
    it("Check edited item and 'Code' text field", function () {
        var textInCode = browser.getText('//*[@id="' + ExtLocator.getId('ubtableview') + '"]//div[.="'+newCode+'"]');
        textInCode.should.equal(newCode);
        var editedItemInGrid = '//*[@id="' + ExtLocator.getId('ubtableview') + '"]//div[.="'+newCode+'"]';
        browser.doubleClick(editedItemInGrid);
        var textInTextAreaAfterEditing = browser.getValue(ExtLocator.getCss('ubtextfield[attributeName=code]') + '-inputEl');
        textInTextAreaAfterEditing.should.equal(newCode);
        browser.click(ExtLocator.getCss("tab[text=ub test main data][active=true]") + '-closeEl');
    });
});

describe("Edit 'Caption' localization", function () {
    it("Select item for editing 'Caption' localization in grid and open tab with edit form of item", function () {
        var itemInGrid = '//*[@id="' + ExtLocator.getId('ubtableview') + '"]//div[.="Код3"]';
        browser.doubleClick(itemInGrid);
        browser.pause(3000);
    });
    it("Edit 'Caption' localization text field", function () {
        browser.setValue((ExtLocator.getCss('ubtextfield[attributeName=caption]') + '-inputEl'),engLoc);
        var GlobeButton = '//div[@data-qtip="Values for other languages"]';
        browser.click(GlobeButton);
        browser.pause(1000);
        browser.setValue((ExtLocator.getCss('ubtextfield[fieldLabel=Ukrainian]') + '-inputEl'),uaLoc);
        browser.click(ExtLocator.getCss('button[text=Change]'));
        browser.click(ExtLocator.getCss('button[cls=save-and-close-action]'));
        browser.pause(1000);
    });
    it("Check edited item and 'Caption' localization text field after editing ENG", function () {
        var textInCaptionEng = browser.getText('//*[@id="' + ExtLocator.getId('ubtableview') + '"]//div[.="'+engLoc+'"]');
        textInCaptionEng.should.equal(engLoc);
        var editedItemInGrid = '//*[@id="' + ExtLocator.getId('ubtableview') + '"]//div[.="'+engLoc+'"]';
        browser.doubleClick(editedItemInGrid);
        var textInCaptionAfterEditing = browser.getValue(ExtLocator.getCss('ubtextfield[attributeName=caption]') + '-inputEl');
        textInCaptionAfterEditing.should.equal(engLoc);
        browser.click(ExtLocator.getCss("tab[text=ub test main data]") + '-closeEl');
    });
    it("Change the interface language English to Ukrainian", function () {
        var UBMenuUA = browser.getText('//*[@id="' + ExtLocator.getId('ubtoolbarmenubutton') + '"]//label[.="Menu"]');
        UBMenuUA.should.equal('Menu');
        browser.click(ExtLocator.getCss('ubtoolbaruser'));
        browser.moveToObject(ExtLocator.getCss('menuitem[text=Change language]'));
        browser.pause(1000);
        browser.click(ExtLocator.getCss('menuitem[text=Ukrainian]'));
        browser.waitForExist(ExtLocator.getCss('button[text=Yes]'));
        browser.click(ExtLocator.getCss('button[text=Yes]'));
        browser.pause(1000);
        browser.waitForExist('//h2');
        var title = browser.getText('//h2');
        title.should.equal('Autotest UB SQLITE');
        console.log('Title is: ' + title);
        browser.setValue(ExtLocator.getCss('textfield[requireText=Користувач]') + '-inputEl', 'admin');
        browser.setValue(ExtLocator.getCss('textfield[inputType=password]') + '-inputEl', 'admin');
        browser.click(ExtLocator.getCss('button[cls=ub-login-btn]'));
        browser.pause(3000);
        var UBMenuEn = browser.getText('//*[@id="' + ExtLocator.getId('ubtoolbarmenubutton') + '"]//label[.="Меню"]');
        UBMenuEn.should.equal('Меню');
    });
    it("Check edited item and 'Caption' localization text field after editing UA", function () {
        browser.click(ExtLocator.getCss('button[text=Test][ui=default-toolbar-small]'));
        browser.click(ExtLocator.getCss('menuitem[text=tst_maindata]'));
        browser.pause(1000);
        var textInCaptionUa = browser.getText('//*[@id="' + ExtLocator.getId('ubtableview') + '"]//div[.="'+uaLoc+'"]');
        textInCaptionUa.should.equal(uaLoc);
        var editedItemInGrid = '//*[@id="' + ExtLocator.getId('ubtableview') + '"]//div[.="'+uaLoc+'"]';
        browser.doubleClick(editedItemInGrid);
        var textInCaptionAfterEditing = browser.getValue(ExtLocator.getCss('ubtextfield[attributeName=caption]') + '-inputEl');
        textInCaptionAfterEditing.should.equal(uaLoc);
        browser.click(ExtLocator.getCss("tab[text=ub test main data]") + '-closeEl');
    });
    it("Change the interface language Ukrainian to English", function () {
        var UBMenuUA = browser.getText('//*[@id="' + ExtLocator.getId('ubtoolbarmenubutton') + '"]//label[.="Меню"]');
        UBMenuUA.should.equal('Меню');
        browser.click(ExtLocator.getCss('ubtoolbaruser'));
        browser.moveToObject(ExtLocator.getCss('menuitem[text=Змінити мову]'));
        browser.pause(1000);
        browser.click(ExtLocator.getCss('menuitem[text=Англійська]'));
        browser.waitForExist(ExtLocator.getCss('button[text=Так]'));
        browser.click(ExtLocator.getCss('button[text=Так]'));
        browser.pause(1000);
        browser.waitForExist('//h2');
        var title = browser.getText('//h2');
        title.should.equal('Autotest UB SQLITE');
        console.log('Title is: ' + title);
        browser.setValue(ExtLocator.getCss('textfield[requireText=Login]') + '-inputEl', 'admin');
        browser.setValue(ExtLocator.getCss('textfield[inputType=password]') + '-inputEl', 'admin');
        browser.click(ExtLocator.getCss('button[cls=ub-login-btn]'));
        browser.pause(3000);
        var UBMenuEn = browser.getText('//*[@id="' + ExtLocator.getId('ubtoolbarmenubutton') + '"]//label[.="Menu"]');
        UBMenuEn.should.equal('Menu');
        browser.pause(1000);
    });
    it("Recheck edited item and 'Caption' localization text field after editing ENG", function () {
        browser.click(ExtLocator.getCss('button[text=Test][ui=default-toolbar-small]'));
        browser.click(ExtLocator.getCss('menuitem[text=tst_maindata]'));
        browser.pause(1000);
        var textInCaptionEng = browser.getText('//*[@id="' + ExtLocator.getId('ubtableview') + '"]//div[.="'+engLoc+'"]');
        textInCaptionEng.should.equal(engLoc);
        var editedItemInGrid = '//*[@id="' + ExtLocator.getId('ubtableview') + '"]//div[.="'+engLoc+'"]';
        browser.doubleClick(editedItemInGrid);
        var textInCaptionAfterEditing = browser.getValue(ExtLocator.getCss('ubtextfield[attributeName=caption]') + '-inputEl');
        textInCaptionAfterEditing.should.equal(engLoc);
        browser.click(ExtLocator.getCss("tab[text=ub test main data][active=true]") + '-closeEl');
    });
});
describe("Edit 'complexCaption'", function () {
    it("Select item for editing 'Code' in grid and open tab with edit form of item", function () {
        var itemInGrid = '//*[@id="' + ExtLocator.getId('ubtableview') + '"]//div[.="Код4"]';
        browser.doubleClick(itemInGrid);
        browser.pause(3000);
    });
    it("Edit 'complexCaption' text field", function () {
        browser.setValue((ExtLocator.getCss('ubtextfield[attributeName=complexCaption]') + '-inputEl'),complexCaption);
        browser.click(ExtLocator.getCss('button[cls=save-and-close-action]'));
        browser.pause(3000);
    });
    it("Check edited item and 'complexCaption' text field", function () {
        var textInComplexCaption = browser.getText('//*[@id="' + ExtLocator.getId('ubtableview') + '"]//div[.="'+complexCaption+'"]');
        textInComplexCaption.should.equal(complexCaption);
        var editedItemInGrid = '//*[@id="' + ExtLocator.getId('ubtableview') + '"]//div[.="'+complexCaption+'"]';
        browser.doubleClick(editedItemInGrid);
        browser.pause(1000);
        var textInCaptionAfterEditing = browser.getValue(ExtLocator.getCss('ubtextfield[attributeName=complexCaption]') + '-inputEl');
        textInCaptionAfterEditing.should.equal(complexCaption);
        browser.click(ExtLocator.getCss("tab[text=ub test main data][active=true]") + '-closeEl');
    });
});
