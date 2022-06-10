import { getStringifiedTranslationsForLanguage } from './convert-translations-to-string';

export function convertTranslationsToFileWriteableStringGlobal(translations: { [key: string]: any }): string {
  return `\n  return {
${ getStringifiedTranslationsForLanguage(translations) }
  };\n`;
}
