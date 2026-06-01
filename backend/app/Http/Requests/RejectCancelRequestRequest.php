<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class RejectCancelRequestRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'rejectionReason' => 'required|string|max:500',
            'adminNotes' => 'nullable|string|max:500',
        ];
    }
}
