/**
 * @author pavel.mash
 * Navigation shortcuts localization to Ukrainian for CDN model
 * Used by `ubcli initialize` command
 * @param {ServerSession} session
 */
module.exports = function(session){
var
    loader = require('@unitybase/base').dataLoader,
    localizationConfig = {
        entity: 'ubm_desktop',
        keyAttribute: 'code',
        localization: [
            {keyValue: 'cdn_desktop',  execParams: {caption: 'საერთო ლექსიკონო'}}
        ]
    };

    loader.localizeEntity(session, localizationConfig, __filename);

    localizationConfig = {
        entity: 'ubm_navshortcut',
        keyAttribute: 'code',
        localization: [
            {keyValue: 'cdn_folder_territorial',  execParams: {caption: 'ტერიტორია'}},
                {keyValue: 'cdn_region',  execParams: {caption: 'რეგიონები'}},
                {keyValue: 'cdn_city',  execParams: {caption: 'ქალაქები'}},
                {keyValue: 'cdn_country',  execParams: {caption: 'ქვეყნები'}},
				{keyValue: 'cdn_adminunit',  execParams: {caption: 'ადმინის ერთეულები'}},
				{keyValue: 'cdn_regiontype',  execParams: {caption: 'რეგიონების ტიპი'}},
				{keyValue: 'cdn_citytype',  execParams: {caption: 'ქალაქების ტიპი'}},
            {keyValue: 'cdn_folder_subjects',  execParams: {caption: 'თემა ან საგანი'}},
                {keyValue: 'cdn_organization',  execParams: {caption: 'ორგანიზაციები'}},
                {keyValue: 'cdn_employee',  execParams: {caption: 'თანამშრომელი'}},
                {keyValue: 'cdn_department',  execParams: {caption: 'დეპარტამენტები'}},
                {keyValue: 'cdn_person',  execParams: {caption: 'პირები'}},
            {keyValue: 'cdn_folder_misc',  execParams: {caption: 'სხვადასხვა'}},
                {keyValue: 'cdn_currency',  execParams: {caption: 'ვალუტა'}}
        ]
    };

    loader.localizeEntity(session, localizationConfig, __filename);
};