<?php

namespace App\Policies;

use App\Models\MedicalCase;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class CasePolicy
{
    use HandlesAuthorization;

    /**
     * Determine whether the user can view any cases.
     * Admin, Viewer, and Engineer can view.
     */
    public function viewAny(User $user): bool
    {
        return in_array($user->role, ['admin', 'viewer', 'engineer']);
    }

    /**
     * Determine whether the user can view the case details.
     */
    public function view(User $user, MedicalCase $case): bool
    {
        return in_array($user->role, ['admin', 'viewer', 'engineer']);
    }

    /**
     * Determine whether the user can create cases.
     * Admin and Engineer can create; Viewer cannot.
     */
    public function create(User $user): bool
    {
        return in_array($user->role, ['admin', 'engineer']);
    }

    /**
     * Determine whether the user can update the case.
     * Admin and Engineer can update; Viewer cannot.
     */
    public function update(User $user, MedicalCase $case): bool
    {
        return in_array($user->role, ['admin', 'engineer']);
    }

    /**
     * Determine whether the user can delete the case.
     * ONLY Admin can delete. Viewer and Engineer cannot.
     */
    public function delete(User $user, MedicalCase $case): bool
    {
        return $user->role === 'admin';
    }
}
