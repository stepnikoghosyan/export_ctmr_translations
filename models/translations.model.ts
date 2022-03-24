import { Languages } from './language.model';

export interface ITranslationsModel {
  filePath: string;
  translations: {
    [key in Languages]: any
  };
}

export interface CSVTableDataModel {
  key: string;
  filePath: string;
  [Languages.EN]: string;
  [Languages.FR]: string;
}
