/*global tinymce */
/**
 * Report template editor.
 */
Ext.define('UB.ux.UBReportEditor', {
    extend: 'UB.ux.UBTinyMCETextArea',
    alias: 'widget.ubreporteditor',

    statics: {
        portrait: {width: 793},
        landscape: {width: 1121},

        paste_postprocess: function(plugin, args) {
            //console.log(args.node);
            //args.node.setAttribute('id', '42');
            UB.ux.UBReportEditor.filter_node(args.node);
        },

        possibleElement: {
            node: ['table', 'thead', 'tbody','tr','td','img','div','p','hr','strong','em','big','span','font',
                'li','ul','ol', 'blockquote',
                'h1','h2','h3','h4','h5','h6','#comment','#text'],
            inlineInnerNode: ['#comment','#text'],
            attributes : ['style', 'data-mce-style', 'src', 'rowspan', 'colspan'],
            style: ['font-family','font-weight','font-style','font-size','text-align','vertical-align','text-indent',
                'list-style-type',
                'list-style-position',
                'background-color',
                'width','height',
                'border-style','border-top-style','border-bottom-style','border-right-style','border-left-style','border',
                'border-width','border-top-width','border-bottom-width','border-right-width','border-left-width',
                'padding','padding-top','padding-bottom','padding-right','padding-left',
                'margin','margin-top','margin-bottom','margin-right','margin-left',
                'disable-split','disableSplit','disablesplit',
                'indissoluble-first-rows','indissoluble-end-rows','draw-border-onsplit','top-through-line']
        },

        filter_node: function(node){
            var me = this, i, y, attr, style, styleElm, stylePair, resStyle = [],
                detail, subDetail, isInline, newNode;

            if (node.nodeName.toLowerCase() === 'table'){
                me.filter_table(node);
            }
            if (node.attributes){
                for(i = node.attributes.length - 1; i >= 0; i--){
                    attr = node.attributes[i];
                    if (me.possibleElement.attributes.indexOf(attr.name.toLowerCase()) < 0){
                        node.removeAttribute(attr.name);
                    }
                }
                style = node.attributes.getNamedItem('style');
                if (style && style.value){
                    style = style.value.split(';');
                    for (i = 0; i <  style.length; i++){
                        styleElm = style[i];
                        if (styleElm){
                            stylePair = styleElm.split(':');
                        }
                        if (stylePair.length === 2 && (typeof(stylePair[0]) === 'string') &&
                            (me.possibleElement.style.indexOf(stylePair[0].toLowerCase()) >= 0)){
                            resStyle.push(styleElm);
                        }
                    }
                    style.value = resStyle.join(';');
                }

            }
            if (node.childNodes){
                for (i = 0; i < node.childNodes.length; i++){
                    detail = node.childNodes[i];
                    if( me.possibleElement.node.indexOf(detail.nodeName.toLowerCase()) < 0){
                        isInline = true;
                        if (detail.childNodes){
                            for(y = 0; y < detail.childNodes.length; y++){
                                subDetail = detail.childNodes[y].nodeName.toLowerCase();
                                if (me.possibleElement.inlineInnerNode.indexOf(subDetail) < 0){
                                    isInline = false;
                                    break;
                                }
                            }
                        }
                        newNode = document.createElement(isInline ? 'SPAN' : 'DIV');
                        me.copyNodeParams(detail, newNode);
                        node.replaceChild(newNode, detail);
                        detail = newNode;
                    }
                    me.filter_node(detail);
                }
            }
        },

        copyNodeParams: function(oldNode, newNode){
            var style, styleAttr;
            if (oldNode.attributes){
                styleAttr = oldNode.attributes.getNamedItem('style');
                style = styleAttr ? styleAttr.value : null;
            }
            if(style){
                newNode.setAttribute('style', style);
            }
            newNode.innerHTML = oldNode.innerHTML;
        },

        filter_table: function(table){
            var tbody, val, attrWidth, styles = [], styleWith;

            val = table.attributes.getNamedItem('width');
            if (val){
                attrWidth = val.value;
            }
            val = table.attributes.getNamedItem('style');
            if (val){
                styles = val.value ? val.value.split(';') : [];
                _.forEach(styles, function(elm){
                    var pair;
                    if (elm){
                        pair = elm.split(':');
                        if (pair.length === 2 && pair[0].toLowerCase() === 'width'){
                            styleWith = pair[1];
                            return false;
                        }
                    }
                });
            } else {
                val = document.createAttribute('style');
                table.attributes.setNamedItem(val);
            }
            if (!styleWith){
                styles.push('width:' + (attrWidth || '100%'));
                val.value = styles.join(';');
            }

            _.forEach(table.childNodes,  function(child){
                if (child.nodeName.toLowerCase() === 'tbody'){
                    tbody = child;
                    return false;
                }
            });

            if(!tbody){
                tbody = document.createElement('TBODY');
                table.appendChild(tbody);
            }

            // this function used only for correct rowSpan and colSpan. It was copy from csHtmlToPdf.js
            this.createSpanTableMap(tbody, [], []);
        },

        /**
         *
         * @param {Object} tbody
         * @param {Array} rowSpan
         * @param {Array} colSpan
         * @returns {Object}
         */
        createSpanTableMap: function(tbody, rowSpan, colSpan){
            var row, q, qi, qq, i, ii, y, cCnt, len, cell, cellLast, rowCount, rowCountR, colCount = 0, cCntR,
                cSpan, rSpan, calc = false, fRow;


            function getAttribute(node, name, defaultValue){
                var val;
                if (!node.attributes){
                    return defaultValue;
                }
                val = node.attributes.getNamedItem(name);
                if (val){
                    return val.value || defaultValue;
                }
                return defaultValue;
            }


            function getAttributeInt(node, name){
                return parseInt(getAttribute(node, name, 0), 10);
            }

            function updateAttributeInt(node, name, value){
                if (!node.attributes){
                    return;
                }
                var val = node.attributes.getNamedItem(name);
                if (val){
                    val.value = value;
                } else {
                    val = document.createAttribute(name);
                    val.value = value;
                    node.attributes.setNamedItem(val);
                }
            }


            for( var p = 0; p < tbody.childNodes.length; p++){
                rowSpan[p] = [];
                colSpan[p] = [];
            }
            rowCountR = 0;
            // create span maps
            rowCount = tbody.childNodes.length;
            for( p = 0; p < rowCount; p++){
                row = tbody.childNodes[p];
                if (row.nodeName.toLowerCase() !== 'tr'){
                    continue;
                }
                rowCountR++;
                // calc cell count
                if (!calc){
                    for( q = 0; q < row.childNodes.length; q++){
                        cell = row.childNodes[q];
                        if (cell.nodeName.toLowerCase() !== 'td'){
                            continue;
                        }
                        cSpan = getAttributeInt(cell, 'colspan');
                        if( cSpan > 1){
                            colCount += cSpan - 1;
                        }
                        colCount++;
                    }
                    calc = true;
                }
                cCntR = 0;
                for( q = 0, qi = 0; (q < colCount); q++){
                    if (colSpan[p][q] || rowSpan[p][q] ){
                        cCntR++;
                        continue;
                    }
                    if (qi >= row.childNodes.length ){
                        continue;
                    }
                    cell = row.childNodes[qi];
                    while (cell.nodeName.toLowerCase() !== 'td'){
                        qi++;
                        cell = row.childNodes[qi];
                    }
                    cellLast = cell;
                    cCntR++;

                    cSpan = getAttributeInt(cell, 'colspan', 0);
                    rSpan = getAttributeInt(cell, 'rowspan', 0);
                    // check valid rowSpan
                    if (rSpan > 1){
                        if (rSpan - 1 + p >= rowCount){
                            rSpan = (rowCount - p) || 1;
                            updateAttributeInt(cell, 'rowspan', rSpan);
                        }
                        for(ii = p + 1, i = p + 1; (i < p + rSpan) && ii < tbody.childNodes.length  ; ii++ ){
                            fRow = tbody.childNodes[ii];
                            if (fRow.nodeName.toLowerCase() !== 'tr'){
                                continue;
                            }
                            len = fRow.childNodes.length;
                            cCnt = 0;
                            for(y = 0; y < len; y++ ){
                                if (fRow.childNodes[y].nodeName.toLowerCase() === 'td'){
                                    cCnt++;
                                    cCnt += (getAttributeInt(fRow.childNodes[y], 'colspan') || 1) - 1;
                                }
                            }
                            len = rowSpan[i].length;
                            for ( y = 0; y < len; y++){
                                if (rowSpan[i][y]){
                                    cCnt++;
                                }
                            }
                            if (cCnt + ((cSpan || 1) - 1) >= colCount){
                                rSpan = i - p;
                                updateAttributeInt(cell, 'rowspan', rSpan);
                                break;
                            }
                            i++;
                        }
                    }
                    // check valid colSpan
                    if (cSpan > 1  ){
                        cCnt = 0;
                        for(i = q; i < colCount; i++ ){
                            if (rowSpan[p][i] ){
                                continue;
                            }
                            cCnt++;
                        }
                        if (cSpan > cCnt){
                            cSpan = cCnt || 1;
                            updateAttributeInt(cell, 'colspan', cSpan);
                        }
                    }
                    if( rSpan > 1){

                        for( var r = p + 1; r < p + rSpan; r++ ){
                            rowSpan[r][q] = 1;
                            if( cSpan > 1){
                                for( qq = q + 1; qq < q + cSpan; qq++ ){
                                    if (!colSpan[r]){
                                        colSpan[r] = [];
                                    }
                                    colSpan[r][qq] = 1;
                                }
                            }
                        }
                    }
                    if(cSpan > 1){
                        //cCntR += cSpan - 1;
                        for( qq = q + 1; qq < q + cSpan; qq++ ){
                            colSpan[p][qq] = 1;
                        }
                    }
                    qi++;
                }
                if (cCntR < colCount){
                    updateAttributeInt(cellLast, 'colspan', colCount - cCntR + 1);
                }
            }
            return { colCount: colCount, rowCount: rowCountR};
        }

    },

    pageWidth: 793,

    /**
     * Set page orientation
     * @param {String} value possible values: portrait, landscape.
     * @returns {boolean}
     */
    setOrientation: function(value){
        var me = this;
        if ((value !== 'landscape') && (value !== 'portrait') ){
            return false;
        }
        me.setWidth( value === 'landscape' ? UB.ux.UBReportEditor.landscape.width: UB.ux.UBReportEditor.portrait.width );
        me.orientation = value;
        return true;
    },

    initComponent: function () {
        var me = this;

        Ext.getBody().getSize();

        me.width =  UB.ux.UBReportEditor.portrait.width;
        me.orientation = 'portrait';
        //me.elementStyle = me.elementStyle || '' + 'width: ' + me.pageWidth + 'px;';

        me.tinyMCEConfig = Ext.apply({
            language_url : $App.connection.baseURL + 'models/adminui/tinymce/langs/' +  $App.connection.userLang() + '.js',
            skin_url: $App.connection.baseURL + 'models/adminui/tinymce/skins/lightgray',
            content_css : $App.connection.baseURL + "models/adminui/tini-mce-content.css",
            table_default_attributes: {
                cellpadding: '3px',
                cellspacing: '0',
                border: '1px',
                width: me.width && me.width > 20 ? me.width - 20: 20,
                style: { wordBreak: "break-all"}
            },
            browser_spellcheck : true,
            convert_urls: false,
            object_resizing: "img,table,p[class=isTopColontitle],p[class=isBottomColontitle]",
            // not exists plugins in new version   'style,advhr,advimage,advlink,iespell,xhtmlxtras,inlinepopups'
            plugins: [
                //"autosave layer noneditable",
                //disabled - " media"
                "advlist autolink lists charmap print preview hr anchor pagebreak", //link image
                "searchreplace wordcount visualblocks visualchars code ", //fullscreen
                "insertdatetime nonbreaking table contextmenu directionality", //save
                "emoticons template textcolor colorpicker templateEditor image paste"  //paste
            ],
            toolbar1: "undo redo | bold italic underline | alignleft aligncenter alignright alignjustify | formatselect fontsizeselect | pageOrientation | Colontitle | borderL borderR borderT borderB borderE borderA | forecolor | bullist numlist outdent indent |",
            contextmenu: 'link image inserttable | cell row column deletetable | rowTemplate',
            // fontselect styleselect
            //toolbar1: "newdocument fullpage | bold italic underline strikethrough | alignleft aligncenter alignright alignjustify | styleselect formatselect fontselect fontsizeselect",
            //toolbar2: "cut copy paste | searchreplace | bullist numlist | outdent indent blockquote | undo redo | link unlink anchor image media code | inserttime preview | forecolor backcolor",
            //toolbar3: "table | hr removeformat | subscript superscript | charmap emoticons | print fullscreen | ltr rtl | spellchecker | visualchars visualblocks nonbreaking template pagebreak restoredraft",

            //enable past data image
            paste_data_images: true,
            paste_postprocess: UB.ux.UBReportEditor.paste_postprocess,
            /*
            remove_linebreaks: false,
            remove_trailing_nbsp: false,
            paste_auto_cleanup_on_paste: false,
            paste_retain_style_properties : "all",
            paste_strip_class_attributes : "none",
            extended_valid_elements:"a[name|href|target|title|onclick],img[class|src|border=0|alt|title|hspace|vspace|width|height|align|onmouseover|onmouseout|name],table[style|class|border=2|width|cellspacing|cellpadding|bgcolor],colgroup,col[style|width],tbody,tr[style|class],td[style|class|colspan|rowspan|width|height],hr[class|width|size|noshade],font[face|size|color|style],span[class|align|style]",
            */


            //content_css : "contents.css",
            statusbar : false,
            menubar: "edit insert view format table tools",
            //menubar: true,
            /*
             menu : {
             //file   : {title : 'File'  , items : 'newdocument'},
             edit   : {title : 'Edit'  , items : 'undo redo | cut copy paste pastetext | selectall'},
             insert : {title : 'Insert', items : 'link media | template hr'},
             view   : {title : 'View'  , items : 'visualaid'},
             format : {title : 'Format', items : 'bold italic underline strikethrough superscript subscript | formats | removeformat'},
             table  : {title : 'Table' , items : 'inserttable tableprops deletetable | cell row column'},
             tools  : {title : 'Tools' , items : 'spellchecker code'}
             },*/
            toolbar_items_size: 'small'
            //height: '100%'
            //resize: true
        }, me.tinyMCEEditorConfig || {} );

        me.tinyMCEConfig.reportEditor = me;

        me.lastFrameHeight = '100%';
        me.callParent(arguments);
    },





    onStartSetup: function(ed){
        var me = this;
        ed.on('change', function(e){
            me.updateSize();
        }, me);
        /*
        ed.on('paste', function(evnt) {
            var cbHtml, pos = 0, portion, cbText = evnt.clipboardData.getData('text/plain');
            cbHtml = evnt.clipboardData.getData('text/HTML');
            if (cbHtml){
                cbText = cbHtml;
            }
            if ( !me.canPastLargeData && !evnt.userDecided && cbText.length > 10000){
                //$App.dialogInfo('PastTooLargeText');
                //UB.view.ErrorWindow.showError({errMsg: 'PastTooLargeText'});
                //window.requestAnimationFrame(function(){return true;});

                evnt.preventDefault();
                $App.dialogYesNo('', 'PastTooLargeText').then(function(choice){
                    if (choice){
                        //var pasteEvent = new ClipboardEvent('paste', { dataType: 'text/plain', data: 'My string' } );
                        //pasteEvent.userDecided = true;
                        //document.dispatchEvent(pasteEvent);

                        //if (!cbHtml){

                           do {
                                if (cbText[pos + 2000 - 1] === '\n'){
                                    portion  = cbText.substr(pos, 2000 - 1);
                                    pos += 2000 - 1;
                                } else {
                                    portion  = cbText.substr(pos, 2000);
                                    pos += 2000;
                                }
                                portion = portion.replace(/\r\n/g,'<br/>').replace(/\n/g,'<br/>');
                                ed.selection.setContent(portion);
                           } while (pos < cbText.length);


                            portion = cbText.replace(/\r\n/g,'<br/>').replace(/\n/g,'<br/>');
                            ed.selection.setContent(portion);

                        } else {
                            ed.selection.setContent(cbText);
                        }
                        me.canPastLargeData = true;
                    }
                });
                return false;
            }
        });
        */

        me.callParent(arguments);
    },

    syncEditorHeight: function(){
        var me = this;
        me.callParent(arguments);
        me.updateSize();
    },

    updateSize: function(){
        var me = this, ed, mehuHeight = 50;
        var edIframe = Ext.get(me.getInputId() + "_ifr");
        if (!me.inResizing && edIframe &&  edIframe.dom && edIframe.dom.contentDocument ){
            ed = me.getEditor();
            if (ed.editorContainer && ed.contentAreaContainer){
                mehuHeight = ed.editorContainer.offsetHeight - ed.contentAreaContainer.offsetHeight + 50;
            }
            me.inResizing = true;
            me.setHeight(edIframe.dom.contentDocument.body.offsetHeight + mehuHeight);
            //edIframe.setHeight( edIframe.dom.contentDocument.body.offsetHeight);
            me.inResizing = false;
        }
    },

    setValue: function(value){
        var me = this, matches, re = /(<!--@\w+?\s*".+?"-->)/gi,
            reOptions = /(<!--%\w+?:(.+?)-->)/gi;
        me.valuesSpecialComments = null;
        if (value && typeof(value) === 'string'){
            matches = value.match(re);
            if (matches && matches.length > 0){
                me.valuesSpecialComments = matches.join('\r\n');
                value = value.replace(re, '');
            }
            // parse options
            matches = value.match(reOptions);
            if (matches && matches.length > 0){
                _.forEach(matches, function(item){
                    var itemVal =  item.match(/<!--%(\w+?\:.+?)-->/)[1];
                    itemVal = itemVal.split(':');
                    if (itemVal[0] === 'pageOrientation'){
                        me.setOrientation(itemVal[1]);
                    }
                });
                value = value.replace(reOptions, '');
            }
        }
        me.callParent([value]);
    },

    getValue: function(sender){
        var me = this, value;
        value = me.callParent();
        value = '<!--%pageOrientation:' + me.orientation + '-->' + value ;
        if (sender === 'UBDocument' && me.valuesSpecialComments){
          value = me.valuesSpecialComments + value;
        }
        return value;
    },

    /* todo make right function isDirty
    isDirty : function() {
        var me = this;
        return !me.disabled && !me.isEqual(me.getValue(), me.originalValue);
    },
    */

    // for get focus in BasePanel
    isFocusableField: true,
    isFocusable: function(){
        return !this.readOnly;
    }


});
