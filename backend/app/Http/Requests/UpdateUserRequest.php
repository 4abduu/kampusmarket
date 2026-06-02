<?php

namespace App\Http\Requests;

use App\Enums\UserRole;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateUserRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true; // Authorization handled by middleware
    }

    /**
     * Get the validation rules that apply to this request.
     */
    public function rules(): array
    {
        $userId = $this->route('user') ?? $this->user()->id;
        $role = $this->user()?->role?->value ?? UserRole::USER->value;

        $facultyRule = Rule::exists('faculties', 'code')
            ->where(fn ($query) => $query->where('is_active', true)->where('code', '!=', 'admin'));

        return [
            'name' => ['sometimes', 'string', 'max:255'],
            'email' => ['sometimes', 'string', 'email', 'max:255', 'unique:users,email,' . $userId],
            'phone' => ['nullable', 'string', 'max:20', 'regex:/^[0-9]+$/'],
            'facultyId' => $role === UserRole::ADMIN->value
                ? ['nullable', 'string', $facultyRule]
                : ['sometimes', 'string', $facultyRule],
            'location' => ['nullable', 'string', 'max:255'],
            'bio' => ['nullable', 'string', 'max:500'],
            'avatar' => ['nullable', 'string', 'max:500'],
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'name.string' => 'Nama harus berupa teks',
            'email.email' => 'Format email tidak valid',
            'email.unique' => 'Email sudah digunakan',
            'facultyId.exists' => 'Fakultas tidak ditemukan atau tidak aktif',
        ];
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        if ($this->has('facultyId')) {
            $this->merge([
                'faculty_id' => $this->facultyId,
            ]);
        }
    }
}
