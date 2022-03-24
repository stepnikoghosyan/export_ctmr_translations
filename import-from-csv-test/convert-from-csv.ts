import { ICsvData, IImportedTranslations } from './models/csv.model';
import { Languages } from '../models/language.model';

export function convertFromCsv(data: ICsvData[]): { imported: IImportedTranslations, unresolved: ICsvData[] } {
  const result: IImportedTranslations = {};
  const unresolvedTranslations: ICsvData[] = [];

  data.map(item => {
    if (!!result[item.filePath]) {
      if (!!result[item.filePath][Languages.EN][item.key] || !!result[item.filePath][Languages.FR][item.key]) {
        // Might be duplicate
        unresolvedTranslations.push(item);
      } else {
        // Import
        result[item.filePath][Languages.EN][item.key] = item[Languages.EN];
        result[item.filePath][Languages.FR][item.key] = item[Languages.FR];
      }
    } else {
      result[item.filePath] = {
        [Languages.EN]: {
          [item.key]: item[Languages.EN]
        },
        [Languages.FR]: {
          [item.key]: item[Languages.FR]
        }
      };
    }
  });

  return {
    imported: result,
    unresolved: unresolvedTranslations
  };
}