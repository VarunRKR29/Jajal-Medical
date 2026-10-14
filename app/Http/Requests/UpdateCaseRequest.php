<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateCaseRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user() && in_array($this->user()->role, ['admin', 'engineer']);
    }

    /**
     * Get the validation rules that apply to the request.
     * On edit, the unique rule must ignore the case being edited.
     */
    public function rules(): array
    {
        $caseId = $this->route('case') ?? $this->route('id');

        return [
            'case_number' => [
                'required',
                'string',
                'max:50',
                Rule::unique('cases', 'case_number')->ignore($caseId),
            ],
            'patient_reference' => [
                'required',
                'string',
                'max:50',
            ],
            'surgeon_name' => [
                'required',
                'string',
                'max:255',
            ],
            'implant_type' => [
                'required',
                'string',
                'max:255',
            ],
            'status' => [
                'required',
                'string',
                Rule::in(['Draft', 'Planning', 'In Review', 'Approved', 'Completed', 'Cancelled']),
            ],
            'priority' => [
                'required',
                'string',
                Rule::in(['Low', 'Medium', 'High']),
            ],
            'surgery_date' => [
                'nullable',
                'date',
            ],
            'notes' => [
                'nullable',
                'string',
            ],
            'hospital_site' => [
                'nullable',
                'string',
                'max:255',
            ],
        ];
    }
}
