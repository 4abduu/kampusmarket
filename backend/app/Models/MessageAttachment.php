<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MessageAttachment extends Model
{
    use HasFactory;

    protected $fillable = [
        'message_id',
        'type',
        'url',
        'sort_order',
    ];

    protected $casts = [
        'sort_order' => 'integer',
    ];

    /**
     * Get the message that owns the attachment.
     */
    public function message()
    {
        return $this->belongsTo(Message::class);
    }

    /**
     * Get the full URL for the attachment.
     */
    public function getUrlAttribute($value): ?string
    {
        if (!$value) {
            return null;
        }

        if (filter_var($value, FILTER_VALIDATE_URL)) {
            return $value;
        }

        $cleanPath = preg_replace('#^/?storage/#', '', $value);
        return asset('storage/' . $cleanPath);
    }
}
