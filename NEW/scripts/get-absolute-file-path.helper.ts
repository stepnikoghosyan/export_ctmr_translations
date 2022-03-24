import { resolve } from "path";
import { PATH_ALIASES } from './ng-project-path-aliases';

let ROOT_DIR = process.argv.slice(2)[0];

// Resolves path with angular project's path aliases (lie @shared/...)
// returns null if given path/absolute path indicates dynamic config file (so that it won't be replaced)
export function getAbsoluteFilePath(path: string, dynamicConfigFilePaths: string[]): string | null {
  if (dynamicConfigFilePaths.includes(path)) {
    return null;
  }

  const ngPathAliases = Object.keys(PATH_ALIASES);

  const foundTsPath = ngPathAliases.find(tsPath => path.includes(tsPath));
  if (!!foundTsPath) {
    const absolutePathFromAlias = resolve(ROOT_DIR, path.replace(foundTsPath, PATH_ALIASES[foundTsPath]) + '.ts');
    if (dynamicConfigFilePaths.includes(absolutePathFromAlias)) {
      return null;
    }

    return absolutePathFromAlias;
  }

  const absolutePathWithoutAlias = resolve(ROOT_DIR, path + '.ts');
  if (dynamicConfigFilePaths.includes(absolutePathWithoutAlias)) {
    return null;
  }
  return absolutePathWithoutAlias;
}
