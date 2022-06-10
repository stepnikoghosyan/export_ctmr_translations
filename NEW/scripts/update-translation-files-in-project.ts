import { Languages } from '../models/languages.model';
import { readFileSync, writeFileSync } from "fs";
import { convertTranslationsToFileWriteableString } from './convert-translations-to-string';
import { getAbsoluteFilePath } from './get-absolute-file-path.helper';
import { convertTranslationsToFileWriteableStringGlobal } from './convert-translations-to-string-globa';

export function updateTranslationFilesInProject(filePath: string, translations: { [key in Languages]: any }): boolean {
  if (filePath.toLowerCase() === 'global') {
    updateGlobalTranslationFiles(translations);
    return true;
  }
  // let oneLine: string;

  const absoluteFilePath = getAbsoluteFilePath(filePath);
  if (!absoluteFilePath) {
    return false;
  }

  const file = readFileSync(absoluteFilePath, { encoding: 'utf-8' });

  // Convert to one line string for regex search
  // oneLine = file.replace(/\n/g, '');

  const newData = file.slice(0, file.indexOf('return')) + convertTranslationsToFileWriteableString(translations) + file.slice(file.indexOf('};') + 2);

  writeFileSync(absoluteFilePath, newData);
  return true;
}

// TODO: refactor to support dynamic languages count and config paths
function updateGlobalTranslationFiles(translations: { [key in Languages]: any }): void {
  const enAbsoluteFilePath = getAbsoluteFilePath('src/app/shared/modules/translations/configs/english-translations.config.ts', true);
  const frAbsoluteFilePath = getAbsoluteFilePath('src/app/shared/modules/translations/configs/french-translations.config.ts', true);

  const enFile = readFileSync(enAbsoluteFilePath, { encoding: 'utf-8' });
  const frFile = readFileSync(frAbsoluteFilePath, { encoding: 'utf-8' });

  const newEnData = enFile.slice(0, enFile.indexOf('return')) + convertTranslationsToFileWriteableStringGlobal(translations[Languages.EN]) + enFile.slice(enFile.indexOf('};') + 2);
  const newFrData = frFile.slice(0, frFile.indexOf('return')) + convertTranslationsToFileWriteableStringGlobal(translations[Languages.FR]) + frFile.slice(frFile.indexOf('};') + 2);

  writeFileSync(enAbsoluteFilePath, newEnData);
  writeFileSync(frAbsoluteFilePath, newFrData);
}
