<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Address extends Model
{
    use HasFactory;

    protected $fillable = [
        'uuid',
        'user_id',
        'label',
        'recipient',
        'phone',
        'address',
        'notes',
        'is_primary',
    ];

    protected $casts = [
        'is_primary' => 'boolean',
    ];

    /**
     * Get the user that owns the address.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Set as primary address.
     */
    public function setAsPrimary(): void
    {
        // Remove primary from other addresses
        static::where('user_id', $this->user_id)
            ->where('id', '!=', $this->id)
            ->update(['is_primary' => false]);

        $this->is_primary = true;
        $this->save();
    }

    /**
     * Get full address with notes.
     */
    public function getFullAddress(): string
    {
        $full = $this->address;
        if ($this->notes) {
            $full .= ' (' . $this->notes . ')';
        }
        return $full;
    }
}
