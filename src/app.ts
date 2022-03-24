import * as ts from "typescript";
import * as _ from 'lodash';
import { readdirSync, readFileSync } from 'fs';
import { resolve } from 'path';
import { Languages } from "../models/language.model";

const createCsvWriter = require('csv-writer').createObjectCsvWriter;

const tsFilePath = `/var/www/test_ctmr_aper/hopar-translations.ts`;

// 1.
// file name: [X]-translations.config.ts
// function name: get[X]Translations

// file name: translations.config.ts
// function name: get[X]Translations

// file name: [X].translations.ts
// function name: get[X]Translations

// 2.
// Enum files in local translations

// 3.
// Enum files with displayValues function (returns 1 language translations)

// 1. Read files
// 2. Execute functions and get translation configs
// 3. export csv

// /var/www/export_ctmr_translations

const ROOT_DIR = '/var/www/export_ctmr_translations'; // process.argv.slice(2)[0];
if (!ROOT_DIR) {
  throw new Error('Please specify root directory');
} else {
  console.log('Root Directory:', ROOT_DIR);
}

const OUTPUT_CSV_PATH = `${ROOT_DIR}`; // process.argv.slice(2)[1];
if (!OUTPUT_CSV_PATH) {
  throw new Error('Please specify output directory');
} else {
  console.log('Output Directory:', OUTPUT_CSV_PATH);
}

const COMPILED_OUTPUT_PATH = `${ROOT_DIR}/hopar`; // process.argv.slice(2)[2];
if (!COMPILED_OUTPUT_PATH) {
  throw new Error('Please specify compiled output directory');
} else {
  console.log('Compiled Output Directory:', COMPILED_OUTPUT_PATH);
}

// Read Translation Config Files
const initialTranslationConfigFilePaths = readdirSync(resolve(ROOT_DIR))
.filter(item => _.includes(item, 'translation') && item.endsWith('.ts'));
console.log('translationConfigFilePaths:', initialTranslationConfigFilePaths);

const finalFilePaths: string[] = [];

function getTranslationConfigFilePaths(): void {
  // Check if they have function which returns translation config type
  initialTranslationConfigFilePaths.forEach((path: string) => {
    const file = readFileSync(resolve(ROOT_DIR, path), 'utf8');

    const doesFileIncludeTranslationConfigFunctions = new RegExp(/export function .*Translation/g).test(file);

    if (doesFileIncludeTranslationConfigFunctions && !finalFilePaths.includes(path)) {
      finalFilePaths.push(path);
    }
  });
}

function compileToJS(fileNames: string[], options: ts.CompilerOptions): void {
  try {
    let program = ts.createProgram(fileNames.map(item => resolve(ROOT_DIR, item)), options);
    let emitResult = program.emit();

    let allDiagnostics = ts
    .getPreEmitDiagnostics(program)
    .concat(emitResult.diagnostics);

    allDiagnostics.forEach(diagnostic => {
      if (diagnostic.file) {
        let { line, character } = ts.getLineAndCharacterOfPosition(diagnostic.file, diagnostic.start!);
        let message = ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n");
        console.log(`${diagnostic.file.fileName} (${line + 1},${character + 1}): ${message}`);
      } else {
        console.log(ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n"));
      }
    });

    // let exitCode = emitResult.emitSkipped ? 1 : 0;
    // console.log(`Process exiting with code '${exitCode}'.`);
    // process.exit(exitCode);
  } catch (ex) {
    console.log('ex:', ex);
  }
}

getTranslationConfigFilePaths();

compileToJS(finalFilePaths, {
  noEmitOnError: true,
  noImplicitAny: true,
  target: ts.ScriptTarget.ES5,
  module: ts.ModuleKind.CommonJS,
  outDir: COMPILED_OUTPUT_PATH
});

function readJsFiles(fileNames: string[]): Array<{ fileName: string, translations: { [key in Languages]: any } }> {
  const translations: Array<{ fileName: string, translations: { [key in Languages]: any } }> = [];

  fileNames.map(item => {
    const module = require.resolve(resolve(ROOT_DIR, item));

    delete require.cache[module]; //clear cache

    const translationConfigObject = require(module);
    console.log('translationConfigObject:', translationConfigObject);

    const getTranslationsFunctionKey = Object.keys(translationConfigObject)
                                             .find((key: string) => key.endsWith('Translations') && typeof translationConfigObject[key] === 'function');
    console.log('getTranslationsFunctionKey:', getTranslationsFunctionKey);

    if (!!getTranslationsFunctionKey) {
      const translationsConfig = translationConfigObject[getTranslationsFunctionKey]();
      console.log('config:', translationsConfig);

      translations.push({
        translations: translationsConfig,
        fileName: item
      });
    } else {
      console.log('could not find function key for', item, '... JS FILE:', translationConfigObject);
    }
  });

  return translations;
}

const compiledFilePaths = finalFilePaths.map(item => `${COMPILED_OUTPUT_PATH}/${item}`);
console.log('compiledFilePaths:', compiledFilePaths);

const translations = readJsFiles(compiledFilePaths.map(item => item.replace('.ts', '.js')));
console.log('TRANSLATIONS:', translations);

const csvWriter = createCsvWriter({
  path: resolve(OUTPUT_CSV_PATH, 'ctmr_translations.csv'),
  header: [
    { id: 'key', title: 'Key' },
    { id: 'fileName', title: 'File name' },
    { id: Languages.EN, title: 'English' },
    { id: Languages.FR, title: 'French' },
  ]
});

const csvData: Array<{ key: string, fileName: string, [Languages.EN]: string, [Languages.FR]: string }> = convertTranslationsToCSVTable(translations);

csvWriter
.writeRecords(csvData)
  .then(() => {
    console.log('The CSV file was written successfully');
    process.exit(0);
  })
  .catch((ex: any) => console.error('Could not write CSV file:', ex));

function convertTranslationsToCSVTable(data: Array<{ fileName: string, translations: { [key in Languages]: any } }>): Array<{ key: string, fileName: string, en: string, fr: string }> {
  const result: Array<{ key: string, fileName: string, en: string, fr: string }> = [];

  data.map(item => {
    // Item is translation config from one file
    result.push(...convertTranslationItemToCSVTable(item));
  });

  return result;
}

function convertTranslationItemToCSVTable(dataItem: { fileName: string, translations: { [key in Languages]: any } }, parentKey?: string): Array<{ key: string, fileName: string, en: string, fr: string }> {
  const result: Array<{ key: string, fileName: string, en: string, fr: string }> = [];

  const translations = dataItem.translations;
  const fileName = dataItem.fileName;

  Object.keys(translations[Languages.EN]).map(key => {
    const KEY = !!parentKey ? `${parentKey}.${key}` : key;

    if (typeof translations[Languages.EN][key] === 'string') {
      result.push({
        key: KEY,
        fileName,
        en: translations[Languages.EN][key],
        fr: translations[Languages.FR][key]
      });
    } else if (typeof translations[Languages.EN][key] === 'object') {
      result.push(...convertTranslationItemToCSVTable({
        fileName,
        translations: {
          [Languages.EN]: translations[Languages.EN][key],
          [Languages.FR]: translations[Languages.FR][key]
        }
      }, KEY));
    }
  });

  return result;
}

// Read files, Compile to JS in given PATH
// Get translations, export CSV
