import { ICsvData } from './models/csv.model';
import { Languages } from '../models/language.model';

export function isTitle(item: ICsvData): boolean {
  return !!item.filePath && !item.key && !item[Languages.EN] && !item[Languages.FR];
}

export function validateValues(item: ICsvData): boolean {
  return !!item.filePath && !!item.key && !!item[Languages.EN] && !!item[Languages.FR];
}

export function isGlobal(item: ICsvData): boolean {
  return !!item.filePath && !!item.key && !!item[Languages.EN] && !!item[Languages.FR] && item.filePath === 'global';
}