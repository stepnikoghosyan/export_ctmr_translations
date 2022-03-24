import { ICsvData } from '../models/csv-data.model';
import { IImportedCsvData } from '../models/imported-csv-data.model';
import { Languages } from '../models/languages.model';

export function convertCsvToTranslations(data: ICsvData[]): { imported: IImportedCsvData[], unresolved: ICsvData[], dynamicTranslations: IImportedCsvData[] } {
  const result: { [filePath: string]: { [key in Languages]: any } } = {};
  const unresolvedTranslations: ICsvData[] = [];
  const dynamicTranslations: { [filePath: string]: { [key in Languages]: any } } = {};

  data.map((item) => {
    if (!!result[item.filePath]) {
      if (!!result[item.filePath][Languages.EN][item.key] || !!result[item.filePath][Languages.FR][item.key]) {
        // Might be duplicate
        unresolvedTranslations.push(item);
      } else if (item.configType === 'static') {
        // Import
        result[item.filePath][Languages.EN][item.key] = item[Languages.EN];
        result[item.filePath][Languages.FR][item.key] = item[Languages.FR];
      } else {
        dynamicTranslations[item.filePath][Languages.EN][item.key] = item[Languages.EN];
        dynamicTranslations[item.filePath][Languages.FR][item.key] = item[Languages.FR];
      }
    } else {
      if (item.configType === 'static') {
        result[item.filePath] = {
          [Languages.EN]: {
            [item.key]: item[Languages.EN]
          },
          [Languages.FR]: {
            [item.key]: item[Languages.FR]
          }
        };
      } else {
        dynamicTranslations[item.filePath] = {
          [Languages.EN]: {
            [item.key]: item[Languages.EN]
          },
          [Languages.FR]: {
            [item.key]: item[Languages.FR]
          }
        };
      }
    }
  });

  return {
    imported: Object.keys(result).map(key => ({
      filePath: key,
      translations: result[key],
    })),
    dynamicTranslations: Object.keys(dynamicTranslations).map(key => ({
      filePath: key,
      translations: result[key],
    })),
    unresolved: unresolvedTranslations
  };
}
