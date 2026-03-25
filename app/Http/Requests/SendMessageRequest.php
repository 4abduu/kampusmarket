<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class SendMessageRequest extends FormRequest
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
        $rules = [
            'content' => ['required_without:fileUrl', 'string', 'max:5000'],
            'type' => ['required', 'in:text,offer,image,file'],
            'fileUrl' => ['required_if:type,image,file', 'nullable', 'string', 'max:500'],
        ];

        // If type is offer, validate offer price
        if ($this->input('type') === 'offer') {
            $rules['offerPrice'] = ['required', 'integer', 'min:0'];
        }

        return $rules;
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'content.required_without' => 'Pesan wajib diisi',
            'content.max' => 'Pesan maksimal 5000 karakter',
            'type.required' => 'Tipe pesan wajib dipilih',
            'type.in' => 'Tipe pesan tidak valid',
            'fileUrl.required_if' => 'File wajib diupload untuk tipe ini',
            'offerPrice.required' => 'Harga penawaran wajib diisi',
            'offerPrice.min' => 'Harga penawaran minimal 0',
        ];
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        if ($this->has('offerPrice') && $this->offerPrice) {
            $this->merge([
                'offer_price' => $this->offerPrice * 100, // Convert to cent
            ]);
        }

        if ($this->has('fileUrl')) {
            $this->merge([
                'file_url' => $this->fileUrl,
            ]);
        }
    }
}
