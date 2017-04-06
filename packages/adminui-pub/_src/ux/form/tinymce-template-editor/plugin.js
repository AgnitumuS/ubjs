/*global tinymce:true */

tinymce.PluginManager.add('templateEditor', function(editor, url) {
    var templateProps;

    templateProps = function() {
        var dom = editor.dom, trElm, data = {}, attr, match, isTrElement;
        trElm = dom.getParent(editor.selection.getStart(), 'tr');
        isTrElement = !!trElm;
        if (!trElm){
            trElm = dom.getParent(editor.selection.getStart(), 'p');
        }
        if (!trElm){
            trElm = dom.getParent(editor.selection.getStart(), 'div');
        }
        if (!trElm){
            trElm = editor.selection.getStart();
        }
        if (trElm){
            if (trElm.previousSibling && trElm.previousSibling.nodeName === "#comment" &&
                trElm.previousSibling.nodeValue && /^{{[#\/]{0,1}?\w*?}}$/.test(trElm.previousSibling.nodeValue)  ){
                match = trElm.previousSibling.nodeValue.match(/^{{[#\/]{0,1}?(\w*?)}}$/);
                if (match && match.length > 1){
                    data.templateType = match[1];
                }
            }
            //data.templateType = editor.dom.getAttrib(trElm, 'templatetype', null);
        } else {
            return;
        }

        editor.windowManager.open({
            title: "Section",
            data: data,
            body: {
                type: 'form',
                layout: 'flex',
                direction: 'column',
                labelGapCalc: 'children',
                padding: 0,
                items: [
                    {
                        type: 'form',
                        labelGapCalc: false,
                        padding: 0,
                        layout: 'grid',
                        columns: 2,
                        defaults: {
                            type: 'textbox'//,
                            //maxWidth: 50
                        },
                        items: [
                            {label: 'Key', name: 'templateType'}
                            //{label: 'Caption', name: 'caption', type: 'checkbox'}
                        ]
                    }
                ]
            },
            onsubmit: function(){
                data = this.toJSON();

                editor.undoManager.transact(function() {
                    var templateType = data.templateType ? data.templateType.trim() : null,
                        prevT, nextT;
                    editor.dom.setAttribs(trElm, {
                        templateType: templateType
                    });
                    var classes = editor.dom.getAttrib(trElm, 'class', '');
                    if (!isTrElement){
                        classes = classes.split(' ');
                        _.forEachRight(classes, function(item, idx){
                           if (item === 'tinymce_templated'){
                               classes.splice(idx,1);
                               return false;
                           }
                        });
                        if (data.templateType){
                            classes.push('tinymce_templated');
                        }
                        editor.dom.setAttribs(trElm, {
                            'class': classes.join(' ')
                        });
                    }
                    if (trElm.previousSibling && trElm.previousSibling.nodeName === "#comment"){
                        prevT = trElm.previousSibling.nodeValue;
                    }
                    if (trElm.nextSibling && trElm.nextSibling.nodeName === "#comment"){
                        nextT = trElm.nextSibling.nodeValue;
                    }
                    if (prevT && nextT && (prevT.substr(1) === nextT.substr(1))){
                        trElm.parentNode.removeChild(trElm.previousSibling);
                        trElm.parentNode.removeChild(trElm.nextSibling);
                    }

                    if (templateType){
                       trElm.insertAdjacentHTML('beforebegin', '<!--{{#' + templateType + '}}-->');
                       trElm.insertAdjacentHTML('afterend', '<!--{{/' + templateType + '}}-->');
                    }

                    if (isTrElement){
                        var tdElem = trElm.childNodes[0];
                        classes = editor.dom.getAttrib(tdElem, 'class', '');
                        classes = classes.split(' ');
                        _.forEachRight(classes, function(item, idx){
                            if (item === 'tinymce_templated_td'){
                                classes.splice(idx,1);
                                return false;
                            }
                        });
                        if (data.templateType){
                            classes.push('tinymce_templated_td');
                        }
                        editor.dom.setAttribs(tdElem, {
                            'class': classes.join(' ')
                        });
                    }

                });
                editor.save();
                editor.save();
            }
        });

    };

    editor.addMenuItem('rowTemplate', {
        text: 'Section',
        shortcut: 'Ctrl+Alt+T',
        //icon: 'link',
        icon: 'row-template-icon',
        //tooltip: 'Add/remove template',
        context: 'edit',
        onPostRender: function(){},
        onclick: templateProps
    });

    editor.addButton('rowTemplate', {
        text: 'Section',
        shortcut: 'Ctrl+Alt+T',
        icon: 'row-template-icon',
        //image: '../js/tinymce/plugins/example/img/example.gif',
        //image: 'plugins/templateEditor/img/Template.png',
        onclick: templateProps
    });

    /*
    editor.addButton("Colontitle", {
        type: "menubutton",
        title: "Colontitle",
        text: 'Colontitle',
        menu: [
            {   text: 'Top',
                onclick : function(){
                    var body = editor.getBody();
                    if (body.querySelectorAll('[class=isTopColontitle]').length > 0){
                        return;
                    }

                    if (body.childNodes && body.childNodes.length > 0){
                       editor.selection.setCursorLocation(body.childNodes[0], 0);
                    }
                    //editor.execCommand('mceInsertContent', false, '<hr />');
                    editor.insertContent('<p class="isTopColontitle" style="border-width: 1px 0; border-style: dashed; border-color: gray; " data-mce-style="display: none" ><!-- topColontitle --> top colontitle</p>');
                }
            },
            {   text: 'Bottom',
                onclick : function(){
                    var body = editor.getBody();
                    if (body.querySelectorAll('[class=isBottomColontitle]').length > 0){
                        return;
                    }
                    if (body.childNodes && body.childNodes.length > 0){
                        editor.selection.setCursorLocation(body.childNodes[body.childNodes.length - 1], 0);
                    } else {
                       editor.selection.setCursorLocation(null, 0);
                    }
                    editor.insertContent('<p class="isBottomColontitle" style="border-width: 1px 0; border-style: dashed; border-color: gray; " data-mce-style="display: none" ><!-- bottomColontitle --> Page {#page} of {#pages}</p>');
                }
            }
        ]
    });
    */
    /*
    editor.on('MouseUp', function(e) {
       if (e.target && editor.selection && editor.selection.controlSelection && (e.target.className === "isTopColontitle" || e.target.className === "isBottomColontitle" )){
          //editor.nodeChanged();
           editor.selection.controlSelection.showResizeRect(e.target);
       }
    });
    */
    /*
    editor.addMenuItem('pageOrientation', {
        text: 'Page orientation',
        menu: [
            {text: 'Portrait', onclick: function(){ alert('Portrait');}},
            {text: 'Landscape', onclick: function(){ alert('Portrait');}}
        ]
    });
    */

    editor.addButton("pageOrientation", {
        type: "menubutton",
        title: "Page orientation",
        text: 'Page orientation',
        menu: [
            { //tinymce.ui.Factory.create(
                //type: 'button',
                text: 'Portrait',
                onclick : function(){
                    editor.settings.reportEditor.setOrientation('portrait');
                    //editor.settings.reportEditor.setWidth(UB.ux.UBReportEditor.portrait.width);
                }
            },
            { //tinymce.ui.Factory.create(
                //type: 'button',
                text: 'Landscape',
                onclick : function(){
                    editor.settings.reportEditor.setOrientation('landscape');
                    //editor.settings.reportEditor.setWidth(UB.ux.UBReportEditor.landscape.width);
                }
            }
             ]
    });


    editor.on('init', function() {
        editor.dom.loadCSS(editor.baseURI.toAbsolute("plugins/templateEditor/css/templateEditor.css"));

        //editor.dom.loadScript(editor.baseURI.toAbsolute('../iframeResizer/iframeResizer.contentWindow.min.js'));
        //editor.contentDocument.write('<script type="text/javascript" src="' +
        //    editor.baseURI.toAbsolute('../iframeResizer/iframeResizer.contentWindow.min.js') + '"></script>');

        //editor.contentDocument.write('<script type="text/javascript" src="' +
        //    editor.baseURI.toAbsolute('plugins/templateEditor/ .js') + '"></script>');


        var alignElements = 'p,h1,h2,h3,h4,h5,h6,td,th,div,ul,ol,li,table,img';
        editor.formatter.register({
            // Change alignment formats to use the deprecated align attribute
            alignleftTe: {selector: alignElements, styles: {align: 'left'}},
            aligncenterTe: {selector: alignElements, styles: {align: 'center'}},
            alignrightTe: {selector: alignElements, styles: {align: 'right'}},
            alignjustifyTe: {selector: alignElements, styles: {align: 'justify'}}
        });

    });
    //editor["on" + oldName] = new Dispatcher(editor, oldName, argsMap);
    editor.on('dblclick', templateProps );
    //function(e) {
    //editor.selection.select(e.target);
    //}
    //tinymce.DOM.loadCSS(tinymce.baseURL + '/plugins/templateEditor/css/ui.css');
});

//tinymce.PluginManager.requireLangPack ('templateEditor', 'ru, uk');
