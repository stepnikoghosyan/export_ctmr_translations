import { Languages } from '../../models/language.model';

export function getTest2Translations(): {[key in Languages]: any} {
  return {
    [Languages.EN]: {
      pageTitle: 'Hopar',
      filterTypes: {
        support_tier: 'Student Support Tier',
        team_board: 'Team Board'
      }
    },
    [Languages.FR]: {
      pageTitle: 'FR Hopar',
      filterTypes: {
        support_tier: 'FR Student Support Tier',
        team_board: 'FR Team Board'
      }
    }
  };
}
