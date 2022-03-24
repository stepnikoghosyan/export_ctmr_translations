import { PATHS } from './paths';

require('util').inspect.defaultOptions.depth = null; // console log objects

import { createReadStream, readFileSync, writeFileSync } from "fs";
import { ICsvData, IImportedTranslations } from './models/csv.model';
import { Languages } from '../models/language.model';
import { isGlobal, isTitle, validateValues } from './read-csv-file-helpers';
import { convertFromCsv } from './convert-from-csv';

const _ = require('lodash');
import { resolve } from 'path';

const csv = require('csv-parser');

const csvData: ICsvData[] = [];
let imported: IImportedTranslations = {};
let unresolved: ICsvData[] = [];

let ROOT_DIR = process.argv.slice(2)[0];
if (!ROOT_DIR) {
  throw new Error('Please specify root directory');
}

export function readAndParseCsv(path: string): Promise<void> {
  return new Promise((resolve) => {
    createReadStream(path)
    .pipe(csv())
    .on('data', (row: ICsvData) => {
      if (!isTitle(row) && !isGlobal(row) && validateValues(row)) {
        csvData.push({
          filePath: row.filePath,
          key: row.key,
          [Languages.EN]: row[Languages.EN],
          [Languages.FR]: row[Languages.FR]
        });
      } else {
        if (!isTitle(row)) {
          unresolved.push(row);
        }
      }
    })
    .on('end', () => {
      const data = convertFromCsv(csvData);
      imported = data.imported;
      unresolved = [...unresolved, ...data.unresolved];

      resolve();

      // console.log('imported:', imported);
      // console.log('unresolved:', unresolved);
    });
  });
}

function convertDotStringToObject(dotString: string, value: string): any | null {
  if (dotString.includes('.')) {
    const result = {};
    let obj = result;

    const [firstKey, ...keys] = dotString.split('.');

    for (let i = 0; i < keys.length; i++) {
      if (i === keys.length - 1) {
        // Last item
        obj[keys[i]] = value;
      } else {
        obj[keys[i]] = {};
      }

      obj = obj[keys[i]];
    }

    console.log('result for', dotString, ':', result);

    return result;
  } else {
    return null;
  }
}

function convertCsvDataToTranslationConfigsGroupedByFilepath(csvData: ICsvData[]): IImportedTranslations {
  const result: IImportedTranslations = {};

  csvData.map(item => {
    if (!result[item.filePath]) {
      result[item.filePath] = {
        [Languages.EN]: {},
        [Languages.FR]: {}
      };
    }

    const convertedEng = convertDotStringToObject(item.key, item[Languages.EN]);
    const convertedFr = convertDotStringToObject(item.key, item[Languages.FR]);
    if (!!convertedEng && convertedFr) {
      const firstKey = item.key.split('.')[0];
      result[item.filePath][Languages.EN][firstKey] = _.merge(
        result[item.filePath][Languages.EN][firstKey],
        convertedEng
      );

      result[item.filePath][Languages.FR][firstKey] = _.merge(
        result[item.filePath][Languages.FR][firstKey],
        convertedFr
      );
    } else {
      result[item.filePath][Languages.EN][item.key] = item[Languages.EN];
      result[item.filePath][Languages.FR][item.key] = item[Languages.FR];
    }
  });

  return result;
}

function getConfigFilePaths(localCsvData = csvData): string[] {
  let paths = localCsvData.map(item => item.filePath);

  // remove duplicates
  paths = Array.from(new Set(paths).values());

  const filesToExclude = [
    'C:\\www\\ctmr_v2_client\\src\\app\\modules\\shared-pages\\modules\\system-defaults\\configs\\edit-defaults-translations.config.ts',
    'path2'
  ];

  paths = paths.filter(item => !filesToExclude.includes(getAbsoluteFilePath(item)));

  console.log('paths:', paths);

  return paths;
}

function getAbsoluteFilePath(path: string): string {
  const tsPaths = Object.keys(PATHS);

  const foundTsPath = tsPaths.find(tsPath => path.includes(tsPath));
  if (!!foundTsPath) {
    return resolve(ROOT_DIR, path.replace(foundTsPath, PATHS[foundTsPath]) + '.ts');
  }

  return resolve(ROOT_DIR, path + '.ts');
}

async function execute() {
  await readAndParseCsv(resolve(process.cwd(), 'import-from-csv', 'CTMR_translations.csv'));

  // const testCsvData = [
  //   {
  //     filePath: resolve(process.cwd(), 'import-from-csv', 'configs', 'test-translations.ts'),
  //     key: 'noFocusMessage.msgAfter',
  //     [Languages.EN]: 'first',
  //     [Languages.FR]: 'FR first'
  //   },
  //   {
  //     filePath: resolve(process.cwd(), 'import-from-csv', 'configs', 'test-translations.ts'),
  //     key: 'assignChangesToSchools',
  //     [Languages.EN]: 'Assign Changes to schools',
  //     [Languages.FR]: 'FR Assign Changes to schools'
  //   },
  //   {
  //     filePath: resolve(process.cwd(), 'import-from-csv', 'configs', 'test2-translations.ts'),
  //     key: 'pageTitle',
  //     [Languages.EN]: 'Hopar',
  //     [Languages.FR]: 'FR Hopar'
  //   },
  //   {
  //     filePath: resolve(process.cwd(), 'import-from-csv', 'configs', 'test2-translations.ts'),
  //     key: 'filterTypes.support_tier',
  //     [Languages.EN]: 'Student Support Tier',
  //     [Languages.FR]: 'FR Student Support Tier'
  //   },
  //   {
  //     filePath: resolve(process.cwd(), 'import-from-csv', 'configs', 'test2-translations.ts'),
  //     key: 'filterTypes.team_board',
  //     [Languages.EN]: 'Team Board',
  //     [Languages.FR]: 'FR Team Board'
  //   },
  // ];

  const translations = convertCsvDataToTranslationConfigsGroupedByFilepath(csvData);
  // console.log('translations:', translations);

  // Open files, change configs
  const configFilePaths = getConfigFilePaths(csvData);

  configFilePaths.map(path => {
    if (!translations[path]) {
      // console.log('no', path, 'in translations');
      return;
    }

    // console.log('\n\nPATH:', path);

    const fileUTF8 = readFileSync(getAbsoluteFilePath(path), { encoding: 'utf-8', flag: 'rs+' }).replace(/\n\s*\n/g, '\n');

    const startOfReturn = fileUTF8.indexOf('return');
    const beforeReturn = fileUTF8.slice(0, startOfReturn);

    // console.log('start:', startOfReturn);
    // console.log('before:', beforeReturn);

    const newFileData = beforeReturn + 'return' + JSON.stringify(translations[path]) + ';}';

    // console.log('newData:', translations[path]);
    writeFileSync(getAbsoluteFilePath(path), newFileData);
  });


}

execute();