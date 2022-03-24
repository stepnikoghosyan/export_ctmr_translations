import { Languages } from './models/language.model';
import { CSVTableDataModel, ITranslationsModel } from './models/translations.model';

export function convertTranslationsToCSVTable(data: ITranslationsModel[]): Array<CSVTableDataModel> {
  const result: Array<CSVTableDataModel> = [];

  data.map(item => {
    // Item is translation config from one file

    // Add file path in separate row
    result.push({
      key: '',
      filePath: item.filePath,
      [Languages.EN]: '',
      [Languages.FR]: ''
    });

    result.push(...convertTranslationItemToCSVTable(item));

    // Add empty row after file's translations
    result.push({
      key: '',
      filePath: '',
      [Languages.EN]: '',
      [Languages.FR]: ''
    });
  });

  return result;
}

function convertTranslationItemToCSVTable(dataItem: ITranslationsModel, parentKey?: string): Array<CSVTableDataModel> {
  const result: Array<CSVTableDataModel> = [];

  const translations = dataItem.translations;
  const filePath = dataItem.filePath;

  Object.keys(translations[Languages.EN]).map(key => {
    const KEY = !!parentKey ? `${parentKey}.${key}` : key;

    if (typeof translations[Languages.EN][key] === 'string') {
      result.push({
        key: KEY,
        filePath,
        en: translations[Languages.EN][key],
        fr: translations[Languages.FR][key]
      });
    } else if (typeof translations[Languages.EN][key] === 'object') {
      result.push(...convertTranslationItemToCSVTable({
        filePath,
        translations: {
          [Languages.EN]: translations[Languages.EN][key],
          [Languages.FR]: translations[Languages.FR][key]
        }
      }, KEY));
    }
  });

  return result;
}
