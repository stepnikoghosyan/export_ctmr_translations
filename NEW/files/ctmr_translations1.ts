import { Languages } from '@shared/modules/translations/models/languages.enum';
import { StudentFilterTypes } from '@shared/components/filter-students/models/filter-types.model';

export function getFilterStudentsTranslations(): {[key in Languages]: any} {
  return {
    [Languages.EN]: {
      selectSchoolsBeforeFilter: 'Select School(s) before filtering',
      formInputs: {
        fieldName: 'Field Name',
        operator: 'Operator',
        filterValue: 'Filter Value',
      },
      filtersHeader: 'Add/Remove a Filter',
      filtersDescription: `Applying a filter will ensure only students matching that filter appear in the Selected Students
        box. Selecting multiple filters will ensure only students meeting all filters selected appear. Additional
        students can be added after filters are applied.`,
      buttons: {
        applyFilters: 'Apply Filters'
      },
      filterTypes: {
        [StudentFilterTypes.first_name]: 'Student First Name',
        [StudentFilterTypes.last_name]: 'Student Last Name',
        [StudentFilterTypes.full_name]: 'Student Full Name',
        [StudentFilterTypes.school]: 'School',
        [StudentFilterTypes.teacher]: 'Assigned Teacher',
        [StudentFilterTypes.gender]: 'Gender',
        [StudentFilterTypes.grade]: 'Grade',
        [StudentFilterTypes.programming_notes]: 'Student Programming Notes',
      }
    },
    [Languages.FR]: {
      selectSchoolsBeforeFilter: 'FR Select School(s) before filtering',
      formInputs: {
        fieldName: 'FR Field Name',
        operator: 'FR Operator',
        filterValue: 'FR Filter Value',
      },
      filtersHeader: 'FR Add/Remove a Filter',
      filtersDescription: `FR Applying a filter will ensure only students matching that filter appear in the Selected Students
        box. Selecting multiple filters will ensure only students meeting all filters selected appear. Additional
        students can be added after filters are applied.`,
      filterWarning: 'FR Students data has been changed. Click "Apply Filters" to see filtered results.',
      buttons: {
        applyFilters: 'FR Apply Filters'
      },
      filterTypes: {
        [StudentFilterTypes.first_name]: 'FR Student First Name',
        [StudentFilterTypes.last_name]: 'FR Student Last Name',
        [StudentFilterTypes.full_name]: 'FR Student Full Name',
        [StudentFilterTypes.school]: 'FR School',
        [StudentFilterTypes.teacher]: 'FR Assigned Teacher',
        [StudentFilterTypes.gender]: 'FR Gender',
        [StudentFilterTypes.grade]: 'FR Grade',
        [StudentFilterTypes.programming_notes]: 'FR Student Programming Notes',
      }
    }
  };
}
