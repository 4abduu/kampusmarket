<?php

namespace App\Traits;

use Illuminate\Support\Str;

/**
 * Trait HasUuid
 * 
 * Secara otomatis men-generate UUID v4 saat model dibuat (creating).
 */
trait HasUuid
{
    /**
     * Boot trait HasUuid
     * Menambahkan generate UUID di satu file saja
     */
    public static function bootHasUuid(): void
    {
        static::creating(function ($model) {
            if (empty($model->uuid)) {
                $model->uuid = Str::uuid()->toString();
            }
        });
    }
}
