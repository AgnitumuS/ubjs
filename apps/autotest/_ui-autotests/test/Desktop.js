require('chai').should();

var ExtLocator = require("./ExtJSlocatorHelper.js");


//Data for "Preparing data for Move folder and shortcut to Desktop test"
//======Add folder======
var timestamp = + new Date();
var folderCaption = 'test_folder_' + timestamp;
var folderCode = 'test_code_folder_' + timestamp;

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

describe("Add Desktop", function () {
    it("Open in the top menu: Administrator- UI- Desktops", function () {
        browser.click(ExtLocator.getCss('button[text=Administrator][ui=default-toolbar-small]'));
        browser.moveToObject(ExtLocator.getCss('menuitem[text=UI]'));
        browser.pause(1000);
        browser.click(ExtLocator.getCss('menuitem[text=Desktops]'));
    });
    it("Open Folder creation window", function () {
        browser.waitForExist(ExtLocator.getCss('button[tooltip=Add (Ctrl+Ins)]') + '-btnEl');
        browser.click(ExtLocator.getCss('button[tooltip=Add (Ctrl+Ins)]') + '-btnEl');
        browser.pause(1000);
    });
    it("Set data for a new Desktop and 'save and close'", function () {
        browser.waitForExist(ExtLocator.getCss('ubtextfield[attributeName=caption]') + '-inputEl');
        browser.setValue(ExtLocator.getCss('ubtextfield[attributeName=caption]') + '-inputEl', 'test_desktop_name');
        browser.setValue(ExtLocator.getCss('ubtextfield[attributeName=code]') + '-inputEl', 'test_desktop_code');
        browser.click(ExtLocator.getCss('button[cls=save-and-close-action]'));
        browser.pause(1000);
    });
    it("Check added Desktop in the grid of Desktops", function () {
        var createdDesktopInTab = browser.isExisting('//*[@id="' + ExtLocator.getId('ubtableview') + '"]//td[.="test_desktop_name"]');
        createdDesktopInTab.should.equal(true);
    });
    it("Reload page and login to the system", function () {
        browser.url('/ubadminui');
        browser.waitForExist('//h2');
        var title = browser.getText('//h2');
        title.should.equal('Autotest UB SQLITE');
        console.log('Title is: ' + title);
        browser.setValue(ExtLocator.getCss('textfield[requireText=Login]') + '-inputEl', 'admin');
        browser.setValue(ExtLocator.getCss('textfield[inputType=password]') + '-inputEl', 'admin');
        browser.click(ExtLocator.getCss('button[cls=ub-login-btn]'));
        // browser.pause(3000);//temporary solution before bug fixing
        // browser.click('.ub-error-win-btn.ub-error-win-btn-ok'); //temporary solution before bug fixing
        browser.pause(1000)
    });
    it("Check added Desktop on the top menu", function () {
        var createdDesktopOnTopMenu = browser.isExisting(ExtLocator.getCss('button[text=test_desktop_name][ui=default-toolbar-small]'));
        createdDesktopOnTopMenu.should.equal(true);
    });
    it("Check added Desktop on the left side bar", function () {
        browser.click(ExtLocator.getCss('button[cls=ub-desktop-button]'));
        var createdDesktopOnLeftSideBar = browser.isExisting(ExtLocator.getCss('menuitem[text=test_desktop_name]'));
        createdDesktopOnLeftSideBar.should.equal(true);
        browser.click(ExtLocator.getCss('button[cls=ub-desktop-button]'));
    });
});

    // it("Preparing data for Move folder and shortcut to Desktop test", function () {
    //     //======Add folder======
    //     browser.click(getIdByExtjs('button[cls=ub-desktop-button]'));
    //     browser.click(getIdByExtjs('menuitem[text=Test]'));
    //     browser.rightClick(getIdByExtjs('navigationpanel'));
    //     browser.waitForVisible(getIdByExtjs('menuitem[text=Add shortcut]'));
    //     browser.click(getIdByExtjs('menuitem[text=Add folder]'));
    //     browser.pause(1000);
    //     var checkboxIsFolderChecked = browser.isExisting(getIdByExtjs('checkboxfield[name=isFolder][checked=true]'));  // Checking the activity of the checkbox "Is folder?"
    //     checkboxIsFolderChecked.should.equal(true);
    //     browser.waitForVisible(getIdByExtjs('ubtextfield[attributeName=caption]') + '-inputEl');
    //     browser.setValue(getIdByExtjs('ubtextfield[attributeName=caption]') + '-inputEl', folderCaption);
    //     browser.waitForVisible(getIdByExtjs('ubtextfield[attributeName=code]') + '-inputEl');
    //     browser.setValue(getIdByExtjs('ubtextfield[attributeName=code]') + '-inputEl', folderCode);
    //     browser.click(getIdByExtjs('button[cls=save-and-close-action]'));
    //     console.log(folderCaption);
    //     browser.waitForVisible('//*[@id="' + getIdByExtjsRAW('ubleftpanel') + '"]//tr[.="'+folderCaption+'"]');
    //     var createdFolder = browser.isExisting('//*[@id="' + getIdByExtjsRAW('ubleftpanel') + '"]//tr[.="'+folderCaption+'"]');
    //     createdFolder.should.equal(true);
    //     //======Add folder======
    //
    //
    // });
    //
    // it("Move folder and shortcut to Desktop test", function () {
    //
    //
    // });

 describe("Open Desktop details", function () {
     it("Open top navbar menu Administrator / UI / Desktops", function () {
         browser.click(ExtLocator.getCss('button[text=Administrator][ui=default-toolbar-small]'));
         browser.moveToObject(ExtLocator.getCss('menuitem[text=UI]'));
         browser.pause(1000);
         browser.click(ExtLocator.getCss('menuitem[text=Desktops]'));
         browser.pause(1000);
     });
     it("Select on existing Desktop and select menu All action / Detail / Shourtcut (Desktop)", function () {
         browser.rightClick('//*[@id="' + ExtLocator.getId('ubtableview') + '"]//td[.="Test"]');
         browser.pause(1000);
         browser.moveToObject(ExtLocator.getCss('menuitem[text=Details][el][hidden=false]'));
         browser.pause(1000);
         browser.click(ExtLocator.getCss('menuitem[text=Shortcut (Desktop)][el][hidden=false]'));
         browser.pause(1000);
     });
     it("Check the details of the selected desktop", function () {
         var check_tst_document = browser.isExisting('//*[@id="' + ExtLocator.getId('tab[text=Desktop->Shortcut] ^ tabpanel[isMainTabPanel!=true] tableview') + '"]//td[.="tst_document"]');
         check_tst_document.should.equal(true);
         var check_tst_clob = browser.isExisting('//*[@id="' + ExtLocator.getId('tab[text=Desktop->Shortcut] ^ tabpanel[isMainTabPanel!=true] tableview') + '"]//td[.="tst_clob"]');
         check_tst_clob.should.equal(true);
         var check_tst_IITSign = browser.isExisting('//*[@id="' + ExtLocator.getId('tab[text=Desktop->Shortcut] ^ tabpanel[isMainTabPanel!=true] tableview') + '"]//td[.="tst_IITSign"]');
         check_tst_IITSign.should.equal(true);
     });
     it("Check the details of the another selected desktop", function () {
         browser.click('//*[@id="' + ExtLocator.getId('panel[title=Desktop][entityName=ubm_desktop] tableview') + '"]//td[.="Administrator"]');
         browser.pause(1000);
         var check_adm_folder_users = browser.isExisting('//*[@id="' + ExtLocator.getId('tab[text=Desktop->Shortcut] ^ tabpanel[isMainTabPanel!=true] tableview') + '"]//td[.="adm_folder_users"]');
         check_adm_folder_users.should.equal(true);
         var check_uba_user = browser.isExisting('//*[@id="' + ExtLocator.getId('tab[text=Desktop->Shortcut] ^ tabpanel[isMainTabPanel!=true] tableview') + '"]//td[.="uba_user"]');
         check_uba_user.should.equal(true);
         var check_uba_userrole = browser.isExisting('//*[@id="' + ExtLocator.getId('tab[text=Desktop->Shortcut] ^ tabpanel[isMainTabPanel!=true] tableview') + '"]//td[.="uba_userrole"]');
         check_uba_userrole.should.equal(true);


     });

 });
describe("Delete Desktop", function () {
    it("Open top navbar menu Administrator / UI / Desktops", function () {
        browser.click(ExtLocator.getCss('button[text=Administrator][ui=default-toolbar-small]'));
        browser.moveToObject(ExtLocator.getCss('menuitem[text=UI]'));
        browser.pause(1000);
        browser.click(ExtLocator.getCss('menuitem[text=Desktops]'));
        browser.pause(1000);
    });
    it("Find Desktop in the grid and delete", function () {
        var DesktopForDelete = ('//*[@id="' + ExtLocator.getId('ubtableview') + '"]//td[.="test_desktop_name"]');
        browser.rightClick(DesktopForDelete);
        browser.click(ExtLocator.getCss('menuitem[text=Delete (Ctrl+Delete)][el][hidden=false]'));
        var deleteMessageBox = browser.getText('//*[@id="' + ExtLocator.getId('messagebox') + '"]//span[.="Confirm delete"]');
        deleteMessageBox.should.equal('Confirm delete');
        console.log('Tab is ' + deleteMessageBox);
        browser.click('//*[@id="' + ExtLocator.getId('messagebox') + '"]//span[.="No"]');
        browser.rightClick(DesktopForDelete);
        browser.click(ExtLocator.getCss('menuitem[text=Delete (Ctrl+Delete)][el][hidden=false]'));
        deleteMessageBox.should.equal('Confirm delete');
        console.log('Tab is ' + deleteMessageBox);
        browser.click('//*[@id="' + ExtLocator.getId('messagebox') + '"]//span[.="Yes"]');
        browser.pause(1000);


    });

    it("Reload page and login to the system", function () {
        browser.url('/ubadminui');
        browser.waitForExist('//h2');
        var title = browser.getText('//h2');
        title.should.equal('Autotest UB SQLITE');
        console.log('Title is: ' + title);
        browser.setValue(ExtLocator.getCss('textfield[requireText=Login]') + '-inputEl', 'admin');
        browser.setValue(ExtLocator.getCss('textfield[inputType=password]') + '-inputEl', 'admin');
        browser.click(ExtLocator.getCss('button[cls=ub-login-btn]'));
        // browser.pause(3000);//temporary solution before bug fixing
        // browser.click('.ub-error-win-btn.ub-error-win-btn-ok'); //temporary solution before bug fixing
        browser.pause(1000)

    });

    it("Check deleted Desktop on the Top Menu", function () {
        var deletedDesktopOnTopMenu = browser.isExisting('//*[contains(@id, "ubtoolbarmenu")]//span[.="test_desktop_name"]'); //In the future, make a more reliable method of verification
        deletedDesktopOnTopMenu.should.equal(false);
    });

});



