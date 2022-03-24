import { Languages } from '../models/languages.model';

export function convertTranslationsToFileWriteableString(translations: {[key in Languages]: any}): string {
  return `\n  return {
    [Languages.EN]: {
${getStringifiedTranslationsForLanguage(translations[Languages.EN])}
    },
    [Languages.FR]: {
${getStringifiedTranslationsForLanguage(translations[Languages.FR])}
    }
  };\n`;
}

function getStringifiedTranslationsForLanguage(translations: {[key: string]: any}, depth = 4): string {
  let str = '';

  let spacesCount: number;

  Object.keys(translations).map((key: string, index: number) => {
    spacesCount = depth;

    if (typeof translations[key] === 'string') {
      // add spaces
      while(spacesCount > 0) {
        str += ' ';
        spacesCount--;
      }
      str += `${key}: '${translations[key]}',${index === Object.keys(translations).length - 1 ? '' : '\n'}`;
    } else {

      // add spaces
      while(spacesCount > 0) {
        str += ' ';
        spacesCount--;
      }

      str += `${key}: {\n${getStringifiedTranslationsForLanguage(translations[key], depth + 2)}
      },${index === Object.keys(translations).length - 1 ? '' : '\n'}`;
    }
  });

  return str;
}
