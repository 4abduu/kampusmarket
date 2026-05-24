<?php if (isset($component)) { $__componentOriginalaa758e6a82983efcbf593f765e026bd9 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginalaa758e6a82983efcbf593f765e026bd9 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => $__env->getContainer()->make(Illuminate\View\Factory::class)->make('mail::message'),'data' => []] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('mail::message'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes([]); ?>


<?php if($type === 'email_verification'): ?>
# Verifikasi Email Anda

Halo **<?php echo new \Illuminate\Support\EncodedHtmlString($recipientName); ?>**, 

Terima kasih telah mendaftar di **KampusMarket**! Untuk menyelesaikan verifikasi email Anda, gunakan kode di bawah:
<?php else: ?>
# Perbarui Password Anda

Halo **<?php echo new \Illuminate\Support\EncodedHtmlString($recipientName); ?>**, 

Kami menerima permintaan untuk mereset password akun Anda. Gunakan kode OTP di bawah untuk melanjutkan:
<?php endif; ?>

<div style="background: linear-gradient(135deg, #10B981 0%, #0D9488 100%); padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
    <div style="background: rgba(255,255,255,0.1); padding: 15px; border-radius: 6px;">
        <p style="margin: 0; color: #fff; font-size: 12px; text-transform: uppercase; letter-spacing: 2px;">
            Kode OTP Anda
        </p>
        <p style="margin: 10px 0 0 0; color: #fff; font-size: 36px; font-weight: bold; letter-spacing: 4px; font-family: monospace;">
            <?php echo new \Illuminate\Support\EncodedHtmlString($otp); ?>

        </p>
    </div>
</div>

**Informasi Penting:**
- Kode OTP ini berlaku selama **<?php echo new \Illuminate\Support\EncodedHtmlString($validityMinutes); ?> menit**
- Jangan bagikan kode ini kepada siapapun
<?php if($type === 'email_verification'): ?>
- Kode ini hanya untuk verifikasi email Anda
<?php else: ?>
- Kode ini hanya untuk reset password Anda
<?php endif; ?>

<?php if($type === 'email_verification'): ?>
Setelah verifikasi, Anda dapat mulai menjual atau membeli di KampusMarket!

Masukkan kode OTP di halaman verifikasi email untuk melanjutkan.
<?php else: ?>
Masukkan kode OTP di halaman reset password untuk melanjutkan.
<?php endif; ?>

---

**Tidak meminta kode ini?**
Abaikan email ini. Jika Anda yakin ini adalah kesalahan, hubungi tim support kami.

<p style="color: #999; font-size: 12px; margin-top: 20px;">
    © <?php echo new \Illuminate\Support\EncodedHtmlString(date('Y')); ?> KampusMarket. Semua hak dilindungi.
</p>

Thanks,<br>
<?php echo new \Illuminate\Support\EncodedHtmlString(config('app.name', 'KampusMarket')); ?> Team
 <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginalaa758e6a82983efcbf593f765e026bd9)): ?>
<?php $attributes = $__attributesOriginalaa758e6a82983efcbf593f765e026bd9; ?>
<?php unset($__attributesOriginalaa758e6a82983efcbf593f765e026bd9); ?>
<?php endif; ?>
<?php if (isset($__componentOriginalaa758e6a82983efcbf593f765e026bd9)): ?>
<?php $component = $__componentOriginalaa758e6a82983efcbf593f765e026bd9; ?>
<?php unset($__componentOriginalaa758e6a82983efcbf593f765e026bd9); ?>
<?php endif; ?>
<?php /**PATH C:\laragon\www\kampusmarket\backend\resources\views/emails/otp.blade.php ENDPATH**/ ?>