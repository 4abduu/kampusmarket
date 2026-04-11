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
            'content' => ['required_without_all:fileUrl,imageUrls', 'string', 'max:5000'],
            'type' => ['required', 'in:text,offer,image,file'],
            'fileUrl' => ['nullable', 'string', 'max:500', 'required_if:type,file'],
            'imageUrls' => ['nullable', 'array', 'max:5', 'required_if:type,image'],
            'imageUrls.*' => ['required', 'string', 'max:500'],
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
            'content.required_without_all' => 'Pesan wajib diisi',
            'content.max' => 'Pesan maksimal 5000 karakter',
            'type.required' => 'Tipe pesan wajib dipilih',
            'type.in' => 'Tipe pesan tidak valid',
            'fileUrl.required_if' => 'File wajib diupload untuk tipe ini',
            'imageUrls.required_if' => 'Minimal 1 gambar wajib diupload untuk pesan gambar',
            'imageUrls.array' => 'Format daftar gambar tidak valid',
            'imageUrls.max' => 'Maksimal 5 gambar per pesan',
            'imageUrls.*.required' => 'URL gambar tidak boleh kosong',
            'imageUrls.*.max' => 'URL gambar maksimal 500 karakter',
            'offerPrice.required' => 'Harga penawaran wajib diisi',
            'offerPrice.min' => 'Harga penawaran minimal 0',
        ];
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        $payload = [];

        if ($this->has('offerPrice') && $this->offerPrice !== null && $this->offerPrice !== '') {
            $payload['offer_price'] = $this->offerPrice * 100; // Convert to cent
        }

        if ($this->has('imageUrls') && is_array($this->imageUrls)) {
            $payload['attachment_urls'] = $this->imageUrls;
        }

        if ($this->input('type') === 'image' && !$this->has('imageUrls') && $this->filled('fileUrl')) {
            $payload['imageUrls'] = [$this->fileUrl];
            $payload['attachment_urls'] = [$this->fileUrl];
        }

        if ($this->input('type') === 'file' && $this->filled('fileUrl')) {
            $payload['attachment_urls'] = [$this->fileUrl];
        }

        if (!empty($payload)) {
            $this->merge($payload);
        }
    }
}
