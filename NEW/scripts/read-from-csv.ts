import { IImportedCsvData } from '../models/imported-csv-data.model';
import { Languages } from '../models/languages.model';
import { ICsvData } from '../models/csv-data.model';
import { createReadStream } from 'fs';
import { convertCsvToTranslations } from './convert-read-csv-values-to-translations';
const csvParser = require('csv-parser');

export function isTitle(item: ICsvData): boolean {
  return !!item.filePath && !item.key && !item[Languages.EN] && !item[Languages.FR];
}

export function validateValues(item: ICsvData): boolean {
  return !!item.filePath && !!item.key && !!item[Languages.EN] && !!item[Languages.FR];
}

export function isGlobal(item: ICsvData): boolean {
  return !!item.filePath && !!item.key && !!item[Languages.EN] && !!item[Languages.FR] && item.filePath === 'global';
}

// Reads values from CSV file, saves to:
// 1. csvRows (resolved rows from CSV)
// 2. unresolvedCsvRows (maybe invalid rows in CSV)
// Then passes resolved data to convertCsvToTranslations(csvRows) to convert them to translations config objects
export function readTranslationsFromCsvFile(path: string): Promise<{ imported: IImportedCsvData[], importedDynamic: IImportedCsvData[], unresolvedCsvRows: ICsvData[], unknownImports: ICsvData[] }> {
  const csvRows: ICsvData[] = [];
  const unresolvedCsvRows: ICsvData[] = [];

  return new Promise((resolve) => {
    createReadStream(path)
      .pipe(csvParser())
      .on('data', (row: ICsvData) => {
        // console.log('data:', row);
        if (!isTitle(row) && !isGlobal(row) && validateValues(row)) {
          csvRows.push({
            filePath: row.filePath,
            key: row.key,
            [Languages.EN]: row[Languages.EN],
            [Languages.FR]: row[Languages.FR],
            configType: row.configType,
          });
        } else {
          if (!isTitle(row)) {
            unresolvedCsvRows.push(row);
          }
        }
      })
      .on('end', () => {
        console.log('onEnd:', csvRows.length, unresolvedCsvRows.length);
        const importResults = convertCsvToTranslations(csvRows);

        resolve({
          imported: importResults.imported,
          importedDynamic: importResults.dynamicTranslations,
          unknownImports: importResults.unresolved,
          unresolvedCsvRows,
        });
      });
  });
}
