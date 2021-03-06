// scripts
import { readTranslationsFromCsvFile } from './scripts/read-from-csv';
import { updateTranslationFilesInProject } from './scripts/update-translation-files-in-project';
import { formatTsFiles } from './scripts/formatter';

// Validations
if (!process.argv.slice(2)[0]) {
  throw new Error('Please specify project root directory');
}

async function execute(): Promise<void> {
  const csvFilePath = './NEW/files/CTMR_translations.csv';

  const translations = await readTranslationsFromCsvFile(csvFilePath);

  console.log('filePaths:', translations.imported.map(item => item.filePath));

  for (const item of translations.imported) {
    const updated = updateTranslationFilesInProject(item.filePath, item.translations);
    if (!!updated) {
      await formatTsFiles([item.filePath]);
    }
  }
}

// Everything works, but enum's are not set like [A.B]: 'value', they are set like b: 'value'
// PROBLEM definition
// I HAVE:
// 1. New Translations config file to write to the file: {[key in Languages]: any}
// 2. Stringified version of the Previous Translations
// GOAL: check if given KEY is an ENUM or regular STRING

function isKeyFromEnum(): void {

}

execute();
