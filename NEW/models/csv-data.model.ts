import { Languages } from './languages.model';

export interface ICsvData {
  filePath: string;
  key: string;
  [Languages.EN]: string;
  [Languages.FR]: string;
}
