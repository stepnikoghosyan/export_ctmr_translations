import { Languages } from './languages.model';

export interface IImportedCsvData {
  filePath: string;
  translations: { [key in Languages]: any };
}
