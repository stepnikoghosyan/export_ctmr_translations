import { resolve } from "path";
import { copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync, statSync } from "fs";
import { join } from 'path';
import * as _ from 'lodash';
import { Languages } from './models/language.model';
import { convertTranslationsToCSVTable } from './convert-translations-to-csv-table';
import { ITranslationsModel } from './models/translations.model';
import { compileToJS } from './compile-to-js';
const rimraf = require('rimraf');
// import * as rimraf from 'rimraf';


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
    const doesFileIncludeTranslationConfigFunctions = new RegExp(/export function .*Translation/g).test(file);

    return isConfigFile && doesFileIncludeTranslationConfigFunctions;
  });
  // console.log('file paths:', configFilePaths);
}

function readJSFilesAndGetTranslationConfigs(filePaths: string[]): ITranslationsModel[] {
  const translations: ITranslationsModel[] = [];

  console.log('\n');

  filePaths.forEach(path => {
    console.log('check path:', path);
    let module;

    try {
      module = require.resolve(resolve(path));
    } catch (ex) {
      console.log('ex 1:', ex);
      throw new Error('stop');
    }

    delete require.cache[module]; //clear cache

    const translationConfigObject = require(module);

    const getTranslationsFunctionKey = Object.keys(translationConfigObject)
      .find((key: string) => key.endsWith('Translations') && typeof translationConfigObject[key] === 'function');

    if (!!getTranslationsFunctionKey) {
      const translationsConfig = translationConfigObject[getTranslationsFunctionKey]();
      console.log('path:', path);
      console.log('config:', translationsConfig);
      console.log('\n');

      translations.push({
        translations: translationsConfig,
        filePath: path
      });
    } else {
      console.log('could not find function key for\"', path, '\"... JS FILE:', translationConfigObject);
    }
  });

  console.log('translations:', translations);

  return translations;
}

function readTSFilesAndGetTranslationConfigs(filePaths: string[]): ITranslationsModel[] {
  const translations: ITranslationsModel[] = [];

  console.log('\n');

  filePaths.forEach(path => {
    console.log('check path:', path);
    let module;

    try {
      module = require.resolve(resolve(path), {
        paths: [
          "src/app/shared/*",
          "src/app/modules/auth/*",
          "src/app/modules/admin/*",
          "src/app/modules/district/*",
          "src/app/modules/school/*",
          "src/app/modules/shared-pages/modules/*"
        ]
      });
    } catch (ex) {
      console.log('ex 1:', ex);
      throw new Error('stop');
    }

    delete require.cache[module]; //clear cache

    const translationConfigObject = require(module);

    const getTranslationsFunctionKey = Object.keys(translationConfigObject)
      .find((key: string) => key.endsWith('Translations') && typeof translationConfigObject[key] === 'function');

    if (!!getTranslationsFunctionKey) {
      const translationsConfig = translationConfigObject[getTranslationsFunctionKey]();
      console.log('path:', path);
      console.log('config:', translationsConfig);
      console.log('\n');

      translations.push({
        translations: translationsConfig,
        filePath: path
      });
    } else {
      console.log('could not find function key for\"', path, '\"... JS FILE:', translationConfigObject);
    }
  });

  console.log('translations:', translations);

  return translations;
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

// console.log('TS:', ts);
// console.log('\n\nJS:', js);

compileToJS(OUTPUT_JS_PATH, ts, PROJECT_DIR);
// const translations = readJSFilesAndGetTranslationConfigs(js);

// const translations = readTSFilesAndGetTranslationConfigs(ts);

// exportCSV(translations);
