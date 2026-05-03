<?php

namespace App\Http\Requests;

use App\Enums\UserRole;
use App\Models\User;
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
     * Get the validation rules that apply to this request.
     */
    public function rules(): array
    {
        return [
            'facultyId' => User::facultyIdRules(UserRole::USER->value, true),
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'facultyId.required' => 'Fakultas wajib dipilih',
            'facultyId.exists' => 'Fakultas tidak ditemukan atau tidak aktif',
        ];
    }
}
