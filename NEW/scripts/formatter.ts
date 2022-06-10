import { CONSTANTS } from '../constants';

const npm = require('npm');

export function formatTsFiles(filePaths: string[]): Promise<void> {
  const _filePaths = [
    ...filePaths.filter(item => item.toLowerCase() !== 'global'),
    CONSTANTS.GLOBAL_TRANSLATIONS_PATH_EN,
    CONSTANTS.GLOBAL_TRANSLATIONS_PATH_FR,
  ];
  return new Promise((resolve) => {
    npm.load((err) => {
      if (err) {
        console.log('ERR:', err);
        return resolve();
      }

      // TODO: formatting global files isn't working
      _filePaths.map(filePath => {
        npm.commands.run(['format-ts', filePath], (runErr) => {
          if (!!runErr) {
            console.error('Could not format', filePath, 'ERROR:', runErr);
          } else {
            console.log('formatted', filePath);
          }

          resolve();
        });
      });
    });
  });
}
