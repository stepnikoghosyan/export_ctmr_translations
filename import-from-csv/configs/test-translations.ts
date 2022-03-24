import { Languages } from '../../models/language.model';

export function getTestTranslations(): {[key in Languages]: any} {
  return {
    [Languages.EN]: {
      noFocusMessage: {
        msgAfter: 'first'
      },
      assignChangesToSchools: 'Assign Changes to schools'
    },
    [Languages.FR]: {
      noFocusMessage: {
        msgAfter: 'FR first'
      },
      assignChangesToSchools: 'FR Assign Changes to schools'
    }
  };
}
