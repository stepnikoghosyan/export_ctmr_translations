const npm = require('npm');

export function formatTsFiles(filePaths: string[]): Promise<void> {
  return new Promise((resolve) => {
    npm.load((err) => {
      if (err) {
        console.log('ERR:', err);
        return resolve();
      }

      filePaths.map(filePath => {
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
