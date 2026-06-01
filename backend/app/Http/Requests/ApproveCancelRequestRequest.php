<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ApproveCancelRequestRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'adminNotes' => 'nullable|string|max:500',
            'refundAmount' => 'nullable|integer|min:0',
        ];
    }
}
