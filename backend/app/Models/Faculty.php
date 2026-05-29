<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;

class Faculty extends Model
{
    use HasFactory;

    protected $fillable = [
        'code',
        'name',
        'description',
        'sort_order',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'sort_order' => 'integer',
    ];

    /**
     * Get the users for the faculty.
     */
    public function users()
    {
        return $this->hasMany(User::class);
    }

    /**
     * Faculties that may be shown to normal users.
     * Excludes the redundant admin row and only returns active faculties.
     */
    public function scopeVisible(Builder $query): Builder
    {
        return $query->where('code', '!=', 'admin')
            ->where('is_active', true);
    }

    /**
     * Faculties that may be managed from the admin panel.
     * Excludes the redundant admin row, but still allows inactive faculties.
     */
    public function scopeManaged(Builder $query): Builder
    {
        return $query->where('code', '!=', 'admin');
    }

    /**
     * Scope for active faculties.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope for ordering by sort_order.
     */
    public function scopeOrdered($query)
    {
        return $query->orderBy('sort_order');
    }

    /**
     * Find by code.
     */
    public static function findByCode(string $code): ?self
    {
        return static::managed()->where('code', $code)->first();
    }
}
