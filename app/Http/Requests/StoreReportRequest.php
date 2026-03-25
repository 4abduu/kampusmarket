<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use App\Enums\ReportPriority;

class StoreReportRequest extends FormRequest
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
            'reportedUserId' => ['required', 'exists:users,uuid'],
            'productId' => ['nullable', 'exists:products,uuid'],
            'reason' => ['required', 'string', 'max:100'],
            'description' => ['required', 'string', 'max:2000'],
            // 'evidence' => ['nullable', 'array', 'max:10'],
            // 'evidence.*' => ['string', 'max:500'],
            'priority' => ['nullable', 'in:low,medium,high'],
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'reportedUserId.required' => 'Pengguna yang dilaporkan wajib dipilih',
            'reportedUserId.exists' => 'Pengguna tidak ditemukan',
            'productId.exists' => 'Produk tidak ditemukan',
            'reason.required' => 'Alasan laporan wajib diisi',
            'reason.max' => 'Alasan maksimal 100 karakter',
            'description.required' => 'Deskripsi wajib diisi',
            'description.max' => 'Deskripsi maksimal 2000 karakter',
            // 'evidence.max' => 'Maksimal 10 bukti',
            'priority.in' => 'Prioritas tidak valid',
        ];
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        if ($this->has('reportedUserId')) {
            $this->merge([
                'reported_user_id' => $this->reportedUserId,
            ]);
        }

        if ($this->has('productId')) {
            $this->merge([
                'product_id' => $this->productId,
            ]);
        }
    }
}
