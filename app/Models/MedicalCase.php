<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MedicalCase extends Model
{
    use HasFactory;

    protected $table = 'cases';

    /**
     * Protected against mass assignment with $fillable as required.
     */
    protected $fillable = [
        'case_number',
        'patient_reference',
        'surgeon_name',
        'implant_type',
        'status',
        'priority',
        'surgery_date',
        'created_by',
        'notes',
        'hospital_site',
    ];

    /**
     * Casts.
     */
    protected $casts = [
        'surgery_date' => 'date',
    ];

    /**
     * Relationship: case belongs to user (creator).
     */
    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Query scope for search by Case Number or Surgeon Name.
     */
    public function scopeSearch($query, ?string $term)
    {
        if (empty($term)) {
            return $query;
        }

        return $query->where(function ($q) use ($term) {
            $q->where('case_number', 'like', "%{$term}%")
              ->orWhere('surgeon_name', 'like', "%{$term}%")
              ->orWhere('patient_reference', 'like', "%{$term}%");
        });
    }

    /**
     * Query scope for status filtering.
     */
    public function scopeFilterStatus($query, ?string $status)
    {
        if (empty($status) || $status === 'All') {
            return $query;
        }

        return $query->where('status', $status);
    }

    /**
     * Query scope for priority filtering.
     */
    public function scopeFilterPriority($query, ?string $priority)
    {
        if (empty($priority) || $priority === 'All') {
            return $query;
        }

        return $query->where('priority', $priority);
    }
}
