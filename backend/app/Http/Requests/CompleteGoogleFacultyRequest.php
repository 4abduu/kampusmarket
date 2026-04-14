<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CompleteGoogleFacultyRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            'facultyId' => ['required', 'string', 'exists:faculties,code'],
            'isCustomerOnly' => ['nullable', 'boolean'],
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'facultyId.required' => 'Fakultas wajib dipilih',
            'facultyId.exists' => 'Fakultas tidak ditemukan',
        ];
    }
}