import { db } from './db.js';
import { CaseStatus, CasePriority } from './types.js';

export const VALID_STATUSES: CaseStatus[] = [
  'Draft',
  'Planning',
  'In Review',
  'Approved',
  'Completed',
  'Cancelled',
];

export const VALID_PRIORITIES: CasePriority[] = ['Low', 'Medium', 'High'];

export interface ValidationResult {
  passes: boolean;
  errors: Record<string, string[]>;
}

export class CaseFormRequest {
  public static validate(
    payload: Record<string, unknown>,
    excludeCaseId?: number
  ): ValidationResult {
    const errors: Record<string, string[]> = {};

    // 1. Case Number: required, unique
    const caseNumber = typeof payload.case_number === 'string' ? payload.case_number.trim() : '';
    if (!caseNumber) {
      errors.case_number = ['The case number field is required.'];
    } else if (caseNumber.length < 3) {
      errors.case_number = ['The case number must be at least 3 characters.'];
    } else {
      const isUnique = db.checkUniqueCaseNumber(caseNumber, excludeCaseId);
      if (!isUnique) {
        errors.case_number = ['The case number has already been taken.'];
      }
    }

    // 2. Patient Reference: required (dummy code, not a real name)
    const patientRef = typeof payload.patient_reference === 'string' ? payload.patient_reference.trim() : '';
    if (!patientRef) {
      errors.patient_reference = ['The patient reference field is required (e.g. PT-98214).'];
    }

    // 3. Surgeon Name: required
    const surgeon = typeof payload.surgeon_name === 'string' ? payload.surgeon_name.trim() : '';
    if (!surgeon) {
      errors.surgeon_name = ['The surgeon name field is required.'];
    }

    // 4. Implant Type: required
    const implant = typeof payload.implant_type === 'string' ? payload.implant_type.trim() : '';
    if (!implant) {
      errors.implant_type = ['The implant type field is required.'];
    }

    // 5. Status: required, one of the allowed list
    const status = payload.status as CaseStatus;
    if (!status) {
      errors.status = ['The status field is required.'];
    } else if (!VALID_STATUSES.includes(status)) {
      errors.status = [
        `The selected status is invalid. Allowed: ${VALID_STATUSES.join(', ')}.`,
      ];
    }

    // 6. Priority: required, one of the allowed list
    const priority = payload.priority as CasePriority;
    if (!priority) {
      errors.priority = ['The priority field is required.'];
    } else if (!VALID_PRIORITIES.includes(priority)) {
      errors.priority = [
        `The selected priority is invalid. Allowed: ${VALID_PRIORITIES.join(', ')}.`,
      ];
    }

    // 7. Surgery Date: optional, valid date
    if (payload.surgery_date) {
      const dateStr = String(payload.surgery_date).trim();
      const timestamp = Date.parse(dateStr);
      if (isNaN(timestamp)) {
        errors.surgery_date = ['The surgery date must be a valid date (YYYY-MM-DD).'];
      }
    }

    return {
      passes: Object.keys(errors).length === 0,
      errors,
    };
  }
}
