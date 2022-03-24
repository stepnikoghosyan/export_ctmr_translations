import { Languages } from '../../models/language.model';

export interface ICsvData {
  filePath: string;
  key: string;
  [Languages.EN]: string;
  [Languages.FR]: string;
}

export interface IImportedTranslations {
  [filePath: string]: {
    [key in Languages]: any;
  }
}

export interface ITranslation {
  filePath: 'string';
  key: string;
}
