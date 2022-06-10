import { IImportedCsvData } from '../models/imported-csv-data.model';
import { Languages } from '../models/languages.model';
import { ICsvData } from '../models/csv-data.model';
import { createReadStream } from 'fs';
import { convertCsvRowsToTranslationObjects } from './convert-read-csv-values-to-translations';

const csvParser = require('csv-parser');

function isValidRow(item: ICsvData): boolean {
  return !!item.filePath && !!item.key && !!item[Languages.EN] && !!item[Languages.FR];
}

function isUnresolvedRow(item: ICsvData): boolean {
  // Do NOT include Titles and Empty lines as unresolved rows

  // Title
  if (!!item.filePath && !item.key && !item[Languages.EN] && !item[Languages.FR]) {
    return false;
  }

  // Empty (blank) line
  if (!item.filePath && !item.key && !item[Languages.EN] && !item[Languages.FR]) {
    return false;
  }

  return true;
}

function isGlobal(item: ICsvData): boolean {
  return item.filePath.toLowerCase() === 'global';
}

// Read values from CSV file, saves to:
// 1. csvRows (resolved rows from CSV ready for import)
// 2. unresolvedCsvRows (invalid rows in CSV, which cannot be converted to objects ready for import)
// Then passes resolved data to convertCsvToTranslations(csvRows) to convert them to translations config objects
export function readTranslationsFromCsvFile(path: string): Promise<{ imported: IImportedCsvData[], unresolvedCsvRows: ICsvData[], possibleDuplications: ICsvData[] }> {
  const csvRows: ICsvData[] = [];
  const globalRows: ICsvData[] = [];
  const unresolvedCsvRows: ICsvData[] = [];

  return new Promise((resolve) => {
    createReadStream(path)
      .pipe(csvParser())
      .on('data', (row: ICsvData) => {
        if (!isValidRow(row)) {
          if (isUnresolvedRow(row)) {
            unresolvedCsvRows.push(row);
          }

          return;
        }

        if (isGlobal(row)) {
          globalRows.push({
            filePath: row.filePath,
            key: row.key,
            [Languages.EN]: row[Languages.EN],
            [Languages.FR]: row[Languages.FR],
          });
        } else {
          // Ordinary rows
          csvRows.push({
            filePath: row.filePath,
            key: row.key,
            [Languages.EN]: row[Languages.EN],
            [Languages.FR]: row[Languages.FR],
          });
        }
      })
      .on('end', () => {
        console.log('onEnd');
        const importResults = convertCsvRowsToTranslationObjects(csvRows, globalRows);

        resolve({
          imported: [...importResults.imported, importResults.importedGlobal],
          possibleDuplications: importResults.possibleDuplications,
          unresolvedCsvRows,
        });
      });
  });
}
