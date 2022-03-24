import { Languages } from '../models/languages.model';
import { readFileSync, writeFileSync } from "fs";
import { convertTranslationsToFileWriteableString } from './convert-translations-to-string';
import { getAbsoluteFilePath } from './get-absolute-file-path.helper';

export function updateTranslationFilesInProject(filePath: string, dynamicConfigFilePaths: string[], translations: { [key in Languages]: any }): boolean {

  // let oneLine: string;

  const absoluteFilePath = getAbsoluteFilePath(filePath, dynamicConfigFilePaths);
  if (!absoluteFilePath) {
    return false;
  }

  const file = readFileSync(filePath, { encoding: 'utf-8' });

  // Convert to one line string for regex search
  // oneLine = file.replace(/\n/g, '');

  const newData = file.slice(0, file.indexOf('return')) + convertTranslationsToFileWriteableString(translations) + file.slice(file.indexOf('};') + 2);

  writeFileSync(filePath, newData);
  return true;
}
