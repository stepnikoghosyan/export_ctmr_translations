import { resolve } from "path";
import { copyFileSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from "fs";
import { join } from 'path';
import * as _ from 'lodash';
import { Languages } from './models/language.model';
import { convertTranslationsToCSVTable } from './convert-translations-to-csv-table';
import { ITranslationsModel } from './models/translations.model';

const rimraf = require('rimraf');


const createCsvWriter = require('csv-writer').createObjectCsvWriter;

// const PROJECT_DIR = '/var/www/test_ctmr_aper';
const PROJECT_DIR = process.argv.slice(2)[0];
if (!PROJECT_DIR) {
  throw new Error('Please specify project directory');
} else {
  console.log('Project Directory:', PROJECT_DIR);
}

const OUTPUT_CSV_PATH = process.argv.slice(2)[1] || `./`;
const COPIED_TS_FILES_PATH = process.argv.slice(2)[2] || './copied_ts';
const OUTPUT_JS_PATH = process.argv.slice(2)[3] || './compiled_js';

let configFilePaths: string[] = [];

function readRootDirectoryAndGetFilePaths(directory: string): void {
  readdirSync(directory).forEach(fileOrDirectory => {
    // console.log('directory:', directory);
    // console.log('fileOrDirectory:', fileOrDirectory);
    const absolutePath = join(directory, fileOrDirectory);
    if (statSync(absolutePath).isDirectory()) {
      return readRootDirectoryAndGetFilePaths(absolutePath);
    } else {
      return configFilePaths.push(absolutePath);
    }
  });
}

function readProjectDirectoriesAndGetFilePaths(): void {
  const codeDirectories = [
    `${PROJECT_DIR}/src/app/modules/`,
    `${PROJECT_DIR}/src/app/shared`,
  ];

  codeDirectories.map(item => readRootDirectoryAndGetFilePaths(item));
}

function filterOutInvalidFiles(): void {
  configFilePaths = configFilePaths.filter(item => {
    const isConfigFile = _.includes(item, 'translation') && item.endsWith('.ts');

    // Check if file has function which returns translation config object
    const file = readFileSync(resolve(item), 'utf8');
    const doesFileIncludeTranslationConfigFunctions = new RegExp(/export function get(.*)Translations\(/g).test(file);

    const isSharedIndex = item === `${PROJECT_DIR}/src/app/shared/modules/translations/configs/index.ts`;

    return isConfigFile && doesFileIncludeTranslationConfigFunctions && !isSharedIndex;
  });
  // console.log('file paths:', configFilePaths);
}

function copyConfigFiles(): { ts: string[], js: string[] } {
  console.log('delete directories');
  rimraf.sync(COPIED_TS_FILES_PATH);
  rimraf.sync(OUTPUT_JS_PATH);
  mkdirSync(COPIED_TS_FILES_PATH);
  mkdirSync(OUTPUT_JS_PATH);

  const tsFilePaths: string[] = [];
  const jsFilePaths: string[] = [];

  configFilePaths.forEach(path => {
    const fileName = path.substring(path.lastIndexOf('/'), path.lastIndexOf('.'));
    const fileExtension = path.substring(path.lastIndexOf('.'));

    const copiedTSPath = `${COPIED_TS_FILES_PATH}${fileName}_${Date.now().toString(36)}${fileExtension}`;
    const jsFilePath = `${OUTPUT_JS_PATH}${fileName}_${Date.now().toString(36)}.js`;
    tsFilePaths.push(copiedTSPath);
    jsFilePaths.push(jsFilePath);
    copyFileSync(path, copiedTSPath);
  });

  return {
    ts: tsFilePaths,
    js: jsFilePaths,
  };
}

function exportCSV(translations: ITranslationsModel[]): void {
  const csvWriter = createCsvWriter({
    path: resolve(OUTPUT_CSV_PATH, 'ctmr_translations.csv'),
    header: [
      { id: 'key', title: 'Key' },
      { id: 'filePath', title: 'File path' },
      { id: Languages.EN, title: 'English' },
      { id: Languages.FR, title: 'French' },
    ]
  });

  csvWriter
    .writeRecords(convertTranslationsToCSVTable(translations) as any[])
    .then(() => {
      console.log('The CSV file was written successfully');
      process.exit(0);
    })
    .catch((ex: any) => console.error('Could not write CSV file:', ex));
}

readProjectDirectoriesAndGetFilePaths();
filterOutInvalidFiles();
const { ts, js } = copyConfigFiles();

function readFilesAsUTF8AndGetTranslations(filePaths: string[]): ITranslationsModel[] {
  const translations: ITranslationsModel[] = [];

  console.log('filePaths:', !!filePaths);
  let oneLine: string;

  try {
    filePaths.forEach((path: string, index: number) => {
      const file = readFileSync(path, { encoding: 'utf-8' });

      oneLine = file.replace(/\n/g, '');
      const functionCode = oneLine.match(/export function (.*)}$/igm)[0];

      writeFileSync(js[index], functionCode);

      // let configString = functionCode.match(/return.*}\s+}/igm);
      // if (!configString) {
      //   console.log('no config string for:', path);
      //   console.log('function code:', functionCode);
      // }

      const configString = functionCode.match(/return.*}\s+}/igm)[0]
        .replace('[Languages.EN]', '\'en\'')
        .replace('[Languages.FR]', '\'fr\'')
        .replace(/return\s*{/igm, '')
        .replace(/\.*};\.*/igm, '');

      const fileTranslations = eval('({' + configString + '})');

      translations.push({
        translations: fileTranslations,
        filePath: path
      });
    });
  } catch (ex) {
    console.log('ex:', ex);
    console.log('filePaths:', !!filePaths);
    // console.log('oneLine:', oneLine);
  }

  return translations;
}

const translations = readFilesAsUTF8AndGetTranslations(ts);

exportCSV(translations);

// const path = ts[0];
// const file = readFileSync(path, { encoding: 'utf-8' });
// const oneLine = file.replace(/\n/g, '');
// console.log('one line:', oneLine);
