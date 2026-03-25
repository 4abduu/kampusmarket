<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use App\Enums\AccountType;

class StoreWithdrawalRequest extends FormRequest
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
            'amount' => ['required', 'integer', 'min:10000'], // Min Rp 10.000
            'accountType' => ['required', 'in:bank,e_wallet'],
            'bankName' => ['required', 'string', 'max:50'],
            'accountNumber' => ['required', 'string', 'max:50'],
            'accountName' => ['required', 'string', 'max:100'],
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'amount.required' => 'Jumlah penarikan wajib diisi',
            'amount.min' => 'Minimal penarikan Rp 10.000',
            'accountType.required' => 'Tipe rekening wajib dipilih',
            'accountType.in' => 'Tipe rekening tidak valid',
            'bankName.required' => 'Nama bank/e-wallet wajib diisi',
            'accountNumber.required' => 'Nomor rekening wajib diisi',
            'accountName.required' => 'Nama pemilik rekening wajib diisi',
        ];
    }

    /**
     * Configure the validator instance.
     */
    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            $user = $this->user();
            $amountInCent = $this->amount * 100;

            // Check if user has enough balance
            if ($user->wallet_balance < $amountInCent) {
                $validator->errors()->add(
                    'amount',
                    'Saldo tidak mencukupi untuk penarikan ini'
                );
            }
        });
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        if ($this->has('accountType')) {
            $this->merge([
                'account_type' => $this->accountType,
            ]);
        }
    }
}
