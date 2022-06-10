import { resolve } from 'path';
import { PATH_ALIASES } from './ng-project-path-aliases';

let ROOT_DIR = process.argv.slice(2)[0];

// TODO: Refactor - remove isGlobal, or at least make it dynamic somehow
// Resolves path with angular project's path aliases (lie @shared/...)
// returns null if given path/absolute path indicates dynamic config file (so that it won't be replaced)
export function getAbsoluteFilePath(path: string, isGlobal = false): string | null {
  // TODO: refactor (should be dynamically passed from CLI)
  if (isGlobal) {
    return resolve(ROOT_DIR, path);
  }

  const ngPathAliases = Object.keys(PATH_ALIASES);

  const foundTsPath = ngPathAliases.find(tsPath => path.includes(tsPath));
  if (!!foundTsPath) {
    return resolve(ROOT_DIR, path.replace(foundTsPath, PATH_ALIASES[foundTsPath]) + '.ts');
  }

  return resolve(ROOT_DIR, path + '.ts');
}
