<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreCaseRequest extends FormRequest
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
     */
    public function rules(): array
    {
        return [
            'case_number' => [
                'required',
                'string',
                'max:50',
                'unique:cases,case_number',
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
