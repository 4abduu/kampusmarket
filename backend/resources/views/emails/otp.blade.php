<x-mail::message>
{{-- OTP Email Template untuk Email Verification, Forgot Password, dan Forgot PIN --}}

@if($type === 'email_verification')
# Verifikasi Email Anda

Halo **{{ $recipientName }}**, 

Terima kasih telah mendaftar di **KampusMarket**! Untuk menyelesaikan verifikasi email Anda, gunakan kode di bawah:
@elseif($type === 'forgot_pin')
# Reset PIN Wallet Anda

Halo **{{ $recipientName }}**, 

Kami menerima permintaan untuk mereset PIN Wallet Anda. Gunakan kode OTP di bawah untuk melanjutkan:
@else
# Perbarui Password Anda

Halo **{{ $recipientName }}**, 

Kami menerima permintaan untuk mereset password akun Anda. Gunakan kode OTP di bawah untuk melanjutkan:
@endif

<div style="background: linear-gradient(135deg, #10B981 0%, #0D9488 100%); padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
    <div style="background: rgba(255,255,255,0.1); padding: 15px; border-radius: 6px;">
        <p style="margin: 0; color: #fff; font-size: 12px; text-transform: uppercase; letter-spacing: 2px;">
            Kode OTP Anda
        </p>
        <p style="margin: 10px 0 0 0; color: #fff; font-size: 36px; font-weight: bold; letter-spacing: 4px; font-family: monospace;">
            {{ $otp }}
        </p>
    </div>
</div>

**Informasi Penting:**
- Kode OTP ini berlaku selama **{{ $validityMinutes }} menit**
- Jangan bagikan kode ini kepada siapapun
@if($type === 'email_verification')
- Kode ini hanya untuk verifikasi email Anda
@elseif($type === 'forgot_pin')
- Kode ini hanya untuk reset PIN Wallet Anda
@else
- Kode ini hanya untuk reset password Anda
@endif

@if($type === 'email_verification')
Setelah verifikasi, Anda dapat mulai menjual atau membeli di KampusMarket!

Masukkan kode OTP di halaman verifikasi email untuk melanjutkan.
@elseif($type === 'forgot_pin')
Masukkan kode OTP di halaman reset PIN Wallet untuk membuat PIN baru.
@else
Masukkan kode OTP di halaman reset password untuk melanjutkan.
@endif

---

**Tidak meminta kode ini?**
Abaikan email ini. Jika Anda yakin ini adalah kesalahan, hubungi tim support kami.

<p style="color: #999; font-size: 12px; margin-top: 20px;">
    © {{ date('Y') }} KampusMarket. Semua hak dilindungi.
</p>

Thanks,<br>
{{ config('app.name', 'KampusMarket') }} Team
</x-mail::message>
