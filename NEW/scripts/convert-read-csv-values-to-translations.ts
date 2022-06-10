import { ICsvData } from '../models/csv-data.model';
import { IImportedCsvData } from '../models/imported-csv-data.model';
import { Languages } from '../models/languages.model';

export function convertCsvRowsToTranslationObjects(data: ICsvData[], dataGlobal: ICsvData[]): { imported: IImportedCsvData[], importedGlobal: IImportedCsvData, possibleDuplications: ICsvData[] } {
  const grouped = groupCsvRowsByFilePath(data, dataGlobal);

  return {
    imported: convertGroupedCsvRowToObject(grouped.imported),
    importedGlobal: convertGroupedCsvRowToObject([grouped.importedGlobal])[0],
    possibleDuplications: grouped.possibleDuplications,
  };
}

function groupCsvRowsByFilePath(data: ICsvData[], dataGlobal: ICsvData[]): { imported: IImportedCsvData[], importedGlobal: IImportedCsvData, possibleDuplications: ICsvData[] } {
  const result: { [filePath: string]: { [key in Languages]: any } } = {};
  const possibleDuplications: ICsvData[] = [];

  data.forEach((item) => {
    if (!!result[item.filePath]) {
      // Add to existing translations
      if (!!result[item.filePath][Languages.EN][item.key] || !!result[item.filePath][Languages.FR][item.key]) {
        // Might be duplicate
        possibleDuplications.push(item);
      } else {
        // Import
        result[item.filePath][Languages.EN][item.key] = item[Languages.EN];
        result[item.filePath][Languages.FR][item.key] = item[Languages.FR];
      }
    } else {
      // Create new translations
      result[item.filePath] = {
        [Languages.EN]: {
          [item.key]: item[Languages.EN],
        },
        [Languages.FR]: {
          [item.key]: item[Languages.FR],
        },
      };
    }
  });

  const globalResult: { [key in Languages]: any } = {
    [Languages.EN]: {},
    [Languages.FR]: {},
  };

  dataGlobal.forEach((item) => {
    globalResult[Languages.EN][item.key] = item[Languages.EN];
    globalResult[Languages.FR][item.key] = item[Languages.FR];
  });

  return {
    imported: Object.keys(result).map(key => ({
      filePath: key,
      translations: result[key],
    })),
    importedGlobal: {
      filePath: dataGlobal[0].filePath,
      translations: globalResult,
    },
    possibleDuplications: possibleDuplications,
  };
}

function convertGroupedCsvRowToObject(data: IImportedCsvData[]): IImportedCsvData[] {
  return data.map((item) => {
    return {
      filePath: item.filePath,
      translations: {
        [Languages.EN]: buildObject(item.translations[Languages.EN]),
        [Languages.FR]: buildObject(item.translations[Languages.FR]),
      },
    };
  });
}

function convertKeyToObject(key: string, value: string, parent?: any): any {
  const paths = key.split('.');
  if (paths.length === 1) {
    return {
      ...parent,
      [key]: value,
    };
  }

  const currentKey = paths[0];

  return {
    ...parent,
    [currentKey]: {
      ...(parent && currentKey in parent ? { ...parent[currentKey] } : undefined),
      ...convertKeyToObject(paths.slice(1).join('.'), value, (parent && currentKey in parent ? parent[currentKey] : undefined)),
    },
  };
}

function buildObject(obj: any) {
  let result = {};

  Object.keys(obj).forEach((key) => {
    result = {
      ...result,
      ...convertKeyToObject(key, obj[key], result),
    };
  });

  return result;
}
