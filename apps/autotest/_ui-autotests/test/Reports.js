require('chai').should();

var ExtLocator = require("./ExtJSlocatorHelper.js");
var fs = require('fs');
const crypto = require('crypto');

function escapeRegExp(string){
    return string.replace(/([.*+?^${}()|\[\]\/\\])/g, "\\$1");
}

var maskLocator = '//div[contains(@class,"x-mask-fixed")]';
var loadingDivLocator = '//div[@id="UBLogo" and not(contains(@style,"display: none"))]/span[.="Loading..."]';

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
        browser.waitForExist(maskLocator, 30000, true);
        browser.waitForExist(loadingDivLocator, 30000, true);
    });
});

describe("Build Report in HTML", function () {
    it("Open 'adm - ui - Report' on top menu", function () {
        browser.click(ExtLocator.getCss('button[text=Administrator][ui=default-toolbar-small]'));
        browser.moveToObject(ExtLocator.getCss('menuitem[text=UI]'));
        var reportsMenuItemLocator = ExtLocator.getCss('menuitem[text=Reports]');
        browser.waitForVisible(reportsMenuItemLocator, 30000);
        browser.click(reportsMenuItemLocator);
    });
    it("Open UBS test report", function () {
        var testReportLocator = '//*[@id="' + ExtLocator.getId('ubtableview') + '-table"]//td[.="UBS"]/following-sibling::td[.="test"]';
        browser.waitForExist(testReportLocator);
        browser.doubleClick(testReportLocator);
        browser.pause(3000);
        browser.waitForVisible(ExtLocator.getCss('tab[tooltip=Report builder]'));
    });
    it("Check mustache link on 'Template' tab", function () {
        var templateTabLocator = ExtLocator.getCss('tab[text=Template]');
        browser.waitForVisible(templateTabLocator);
        browser.click(templateTabLocator);
        browser.pause(3000);
        var frameLocator = '//*[@id="' + ExtLocator.getId('ubreporteditor') + '"]//iframe';
        browser.waitForExist(frameLocator);
        var frameId = browser.getAttribute(frameLocator, 'id');
        console.log(frameId);
        browser.frame(frameId);
        var mustacheHref = browser.getAttribute('//a[.="Mustache"]', 'href');
        mustacheHref.should.equal('https://github.com/janl/mustache.js');
        console.log(mustacheHref);
        browser.frame(null);
    });
    it("Complare template source code with a sample", function () {
        browser.click('//button[starts-with(@id,"mceu_") and contains(.,"Tools")]');
        browser.pause(3000);
        browser.click('//span[starts-with(@id,"mceu_") and contains(.,"Source code")]');
        browser.pause(3000);
        var reportHtmlSource = browser.getValue('//textarea[starts-with(@id,"mceu_")]');
        console.log(reportHtmlSource);
        var sampleFilePath = browser.options.mochaOpts.files[0]
            .replace(/\\test.+\.js/i, "\\ExpectedOriginalReport.htm");
        var sampleBefore = fs.readFileSync(sampleFilePath, 'utf8');
        var myRegExp = new RegExp('blob:'+ escapeRegExp(browser.options.baseUrl) +'/[0-9a-f-]+', 'ig');
        sampleBefore =                     sampleBefore.replace(myRegExp, 'XXXX');
        sampleBefore =                     sampleBefore.replace(/\r\n/g,'\n');
        var reportHtmlSourceReplaced = reportHtmlSource.replace(myRegExp, 'XXXX');
        var compareResult = sampleBefore.localeCompare(reportHtmlSourceReplaced);
        console.log('compareResult=' + compareResult);
        compareResult.should.equal(0);
    });
    it("Edit template source code", function () {
        var reportHtmlSource = browser.getValue('//textarea[starts-with(@id,"mceu_")]');
        browser.setValue('//textarea[starts-with(@id,"mceu_")]', '<h1 style="text-align: center;">uiatuomation, changed!</h1>'
            + reportHtmlSource
        );
        browser.pause(1000);
        browser.click('//div[starts-with(@id,"mceu_")]/button[.="Ok"]');
        browser.pause(1000);
        browser.click(ExtLocator.getCss('button[cls=save-action][el]'));
        browser.pause(1000);
    });
    it("Find sample fragment in code on 'Code' tab", function () {
        browser.pause(1000);
        browser.moveToObject(ExtLocator.getCss('tab[text=Code]'));
        browser.pause(1000);
        browser.moveToObject(ExtLocator.getCss('tab[text=Code]'));
        browser.pause(1000);
        browser.click(ExtLocator.getCss('tab[text=Code]'));
        browser.pause(1000);
        var reportCodeText = browser.getText(ExtLocator.getCss('ubdocument[attributeName=code]'));
        var phrasePresenceIndex = reportCodeText.indexOf("return me.buildReportOnServer(reportParams)");
        console.log('phrasePresenceIndex = ' + phrasePresenceIndex);
        phrasePresenceIndex.should.not.equal(-1);
    });
    it("Build HTML report client side", function () {
        browser.click(ExtLocator.getCss('button[text=Test(html)]'));
        browser.pause(1000);

        browser.setValue(ExtLocator.getCss('datefield[fieldLabel=Birthday]')+ '-inputEl', '01/01/2017');
        browser.pause(1000);
        browser.click(ExtLocator.getCss('button[el][text=Build]'));
        browser.pause(5000);
        browser.waitForExist('//*[@id="' + ExtLocator.getId('window[hidden=false] ubtinymcetextarea') + '"]//iframe');
    });
    it("Compare HTML report source code with a sample", function () {
        var frameId = browser.getAttribute('//*[@id="' + ExtLocator.getId('window[hidden=false] ubtinymcetextarea') + '"]//iframe', 'id');
        console.log(frameId);
        browser.frame(frameId);
        var BuiltReportHtml = browser.getAttribute('//body', 'innerHTML');
        console.log(BuiltReportHtml);
        var sampleAfterFilePath = browser.options.mochaOpts.files[0]
            .replace(/\\test.+\.js/i, "\\ExpectedEditedReport.htm");
        var sampleAfter = fs.readFileSync(sampleAfterFilePath, 'utf8');
        var myRegExp = new RegExp('blob:'+ escapeRegExp(browser.options.baseUrl) +'/[0-9a-f-]+', 'ig');
        sampleAfter =                     sampleAfter.replace(myRegExp, 'XXXX');
        var BuiltReportHtmlReplaced = BuiltReportHtml.replace(myRegExp, 'XXXX');
        var compareResultAfter = sampleAfter.localeCompare(BuiltReportHtmlReplaced);
        console.log('compareResultAfter=' + compareResultAfter);
        compareResultAfter.should.equal(0);
        browser.frame(null);
    });
    it("Check presence of mustache link in HTML report", function () {
        var frameId = browser.getAttribute('//*[@id="' + ExtLocator.getId('window[hidden=false] ubtinymcetextarea') + '"]//iframe', 'id');
        console.log(frameId);
        browser.frame(frameId);
        var mustacheHref = browser.getAttribute('//a[.="Mustache"]', 'href');
        mustacheHref.should.equal('https://github.com/janl/mustache.js');
        console.log(mustacheHref);
        browser.frame(null);
        browser.pause(1000);
    });
    it("Close HTML report window and Report builder tab", function () {
        var reportInWindowLocator = ExtLocator.getCss('ubtinymcetextarea[name!=template][readOnly=true]');
        browser.click('//*[@id="' + ExtLocator.getId('window[hidden=false]') + '"]//img[contains(@class,"x-tool-close")]');
        browser.waitForExist(reportInWindowLocator, 5000, true);
        browser.click(ExtLocator.getCss('tab[text=Report builder]') + '-closeEl');
        browser.waitForExist(reportInWindowLocator, 3000, true);
    })
});

describe("Build Report in PDF", function () {
    it("Open 'adm - ui - Report' on top menu", function () {
        browser.click(ExtLocator.getCss('button[text=Administrator][ui=default-toolbar-small]'));
        browser.moveToObject(ExtLocator.getCss('menuitem[text=UI]'));
        var reportsMenuItemLocator = ExtLocator.getCss('menuitem[text=Reports]');
        browser.waitForVisible(reportsMenuItemLocator, 30000);
        browser.click(reportsMenuItemLocator);
    });
    it("Open TST test2 report", function () {
        var testReportLocator = '//*[@id="' + ExtLocator.getId('ubtableview') + '-table"]//td[.="TST"]/following-sibling::td[.="test2"]';
        browser.waitForExist(testReportLocator);
        browser.doubleClick(testReportLocator);
        browser.pause(3000);
        browser.waitForVisible(ExtLocator.getCss('tab[tooltip=Report builder]'));
    });
    it("Build PDF report client side", function () {
        browser.waitForVisible(ExtLocator.getCss('button[text=Test(pdf)]'));
        browser.click(ExtLocator.getCss('button[text=Test(pdf)]'));
        browser.pause(1000);

        browser.setValue(ExtLocator.getCss('datefield[fieldLabel=Birthday]')+ '-inputEl', '01/02/2017');
        browser.pause(1000);
        browser.click(ExtLocator.getCss('button[el][text=Build]'));
        browser.pause(5000);
        var pdfIframeLocator = '//*[@id="' + ExtLocator.getId('ubpdf') + '"]/iframe';
        browser.waitForExist(pdfIframeLocator);
    });
    it("Download PDF report and compare MD5 hash with a sample", function () {
        var pdfIframeLocator = '//*[@id="' + ExtLocator.getId('ubpdf') + '"]/iframe';
        var blobLink = browser.getAttribute(pdfIframeLocator, 'src');
        console.log(blobLink);

        // get PDF content from blob URL via hack
        browser.execute(function(url) {
            function abToB64(buf) {
             var binary = "";
             var bytes = new Uint8Array(buf);
             var len = bytes.byteLength;
             for (var i = 0; i < len; i++){
              binary += String.fromCharCode( bytes[i] );
             }
             return window.btoa(binary);
            }
            var oReq = new XMLHttpRequest();
            oReq.open("GET", url, true);
            oReq.responseType = "arraybuffer";
            oReq.onload = function(e){
             var tmpDiv = document.createElement("div");
             tmpDiv.id = "tmpBufferDiv_id";
             tmpDiv.textContent = abToB64(oReq.response);
            document.body.appendChild(tmpDiv);
            };
            oReq.send();
        }, blobLink);
        browser.waitForExist('#tmpBufferDiv_id');
        var base64DocText = browser.getText('#tmpBufferDiv_id');
        var binaryDocPdf = Buffer.from(base64DocText, 'base64');
        var actualPdfLength = binaryDocPdf.byteLength;
        actualPdfLength.should.equal(1125163);

        // replace date fragment with '1' symbols
        for(var offset = 0x1123c0; offset <= 0x1123c0 + 21; offset++){
            binaryDocPdf[offset] = 0x30;
        }

        // compare hash
        const hash = crypto.createHash('md5');
        hash.update(binaryDocPdf);
        var binaryDocPdfHashMd5 = hash.digest('hex');
        console.log(binaryDocPdfHashMd5);
        binaryDocPdfHashMd5.should.equal('313d4a8d6f5b644ea9e0113daeed844a');
    });
    it("Close PDF report window and Report builder tab", function () {
        var reportInWindowLocator = '//*[@id="' + ExtLocator.getId('ubpdf') + '"]/iframe';
        browser.click('//*[@id="' + ExtLocator.getId('window[hidden=false]') + '"]//img[contains(@class,"x-tool-close")]');
        browser.waitForExist(reportInWindowLocator, 5000, true);
        browser.click(ExtLocator.getCss('tab[text=Report builder]') + '-closeEl');
        browser.waitForExist(reportInWindowLocator, 3000, true);
    })
});
