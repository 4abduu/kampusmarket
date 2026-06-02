<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateProfileRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => 'sometimes|string|max:255',
            'phone' => 'nullable|string|max:20|regex:/^[0-9]+$/',
            'facultyId' => [
                'nullable',
                'string',
                Rule::exists('faculties', 'code')
                    ->where(fn ($query) => $query->where('is_active', true)->where('code', '!=', 'admin')),
            ],
            'location' => 'nullable|string|max:255',
            'bio' => 'nullable|string|max:500',
            'avatar' => 'nullable|string|max:500',
        ];
    }
}
