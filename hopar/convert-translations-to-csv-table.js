"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertTranslationsToCSVTable = void 0;
var language_model_1 = require("./models/language.model");
function convertTranslationsToCSVTable(data) {
    var result = [];
    data.map(function (item) {
        // Item is translation config from one file
        var _a, _b;
        // Add file path in separate row
        result.push((_a = {
                key: '',
                filePath: item.filePath
            },
            _a[language_model_1.Languages.EN] = '',
            _a[language_model_1.Languages.FR] = '',
            _a));
        result.push.apply(result, convertTranslationItemToCSVTable(item));
        // Add empty row after file's translations
        result.push((_b = {
                key: '',
                filePath: ''
            },
            _b[language_model_1.Languages.EN] = '',
            _b[language_model_1.Languages.FR] = '',
            _b));
    });
    return result;
}
exports.convertTranslationsToCSVTable = convertTranslationsToCSVTable;
function convertTranslationItemToCSVTable(dataItem, parentKey) {
    var result = [];
    var translations = dataItem.translations;
    var filePath = dataItem.filePath;
    Object.keys(translations[language_model_1.Languages.EN]).map(function (key) {
        var _a;
        var KEY = !!parentKey ? parentKey + "." + key : key;
        if (typeof translations[language_model_1.Languages.EN][key] === 'string') {
            result.push({
                key: KEY,
                filePath: filePath,
                en: translations[language_model_1.Languages.EN][key],
                fr: translations[language_model_1.Languages.FR][key]
            });
        }
        else if (typeof translations[language_model_1.Languages.EN][key] === 'object') {
            result.push.apply(result, convertTranslationItemToCSVTable({
                filePath: filePath,
                translations: (_a = {},
                    _a[language_model_1.Languages.EN] = translations[language_model_1.Languages.EN][key],
                    _a[language_model_1.Languages.FR] = translations[language_model_1.Languages.FR][key],
                    _a)
            }, KEY));
        }
    });
    return result;
}
