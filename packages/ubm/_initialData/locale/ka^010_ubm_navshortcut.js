/**
 * @author pavel.mash
 * Navigation shortcuts localization to Ukrainian for UBM model
 * Used by `ubcli initialize` command
 * @param {ServerSession} session
 */
module.exports = function(session){
var
    loader = require('@unitybase/base').dataLoader;

    localizationConfig = {
        entity: 'ubm_navshortcut',
        keyAttribute: 'code',
        localization: [
            {keyValue: 'adm_folder_UI',  execParams: {caption: 'მომხმარებლის ინტერფეისი'}},
                {keyValue: 'ubm_enum',  execParams: {caption: 'რიცხვები'}},
                {keyValue: 'ubm_desktop',  execParams: {caption: 'სამუშაო ეკრანი'}},
                {keyValue: 'ubm_navshortcut',  execParams: {caption: 'მალხმობები'}},
				{keyValue: 'ubm_form',  execParams: {caption: 'ფორმები'}},
                {keyValue: 'ubm_diagram',  execParams: {caption: 'პიროვნული ურთიერთობის დიაგრამები'}}
        ]
    };

    loader.localizeEntity(session, localizationConfig, __filename);
};