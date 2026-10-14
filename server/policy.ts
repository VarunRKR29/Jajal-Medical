import { User, MedicalCase } from './types.js';

export class CasePolicy {
  /**
   * Determine whether the user can view any models.
   */
  public static viewAny(user: User): boolean {
    return ['admin', 'viewer', 'engineer'].includes(user.role);
  }

  /**
   * Determine whether the user can view the model.
   */
  public static view(user: User, _caseItem?: MedicalCase): boolean {
    return ['admin', 'viewer', 'engineer'].includes(user.role);
  }

  /**
   * Determine whether the user can create models.
   * Admin and Engineer can create; Viewer cannot.
   */
  public static create(user: User): boolean {
    return ['admin', 'engineer'].includes(user.role);
  }

  /**
   * Determine whether the user can update the model.
   * Admin and Engineer can update; Viewer cannot.
   */
  public static update(user: User, _caseItem?: MedicalCase): boolean {
    return ['admin', 'engineer'].includes(user.role);
  }

  /**
   * Determine whether the user can delete the model.
   * ONLY Admin can delete. Viewer and Engineer cannot.
   */
  public static delete(user: User, _caseItem?: MedicalCase): boolean {
    return user.role === 'admin';
  }
}
