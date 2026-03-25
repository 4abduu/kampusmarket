<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Enums\MessageType;
use App\Enums\OfferStatus;

class Message extends Model
{
    use HasFactory;

    protected $fillable = [
        'uuid',
        'chat_id',
        'sender_id',
        'content',
        'type',
        'offer_price',
        'offer_status',
        'file_url',
        'is_read',
        'read_at',
    ];

    protected $casts = [
        'offer_price' => 'integer',
        'is_read' => 'boolean',
        'read_at' => 'datetime',
        'type' => MessageType::class,
        'offer_status' => OfferStatus::class,
    ];

    /**
     * Get the chat that owns the message.
     */
    public function chat()
    {
        return $this->belongsTo(Chat::class);
    }

    /**
     * Get the sender of the message.
     */
    public function sender()
    {
        return $this->belongsTo(User::class, 'sender_id');
    }

    /**
     * Mark message as read.
     */
    public function markAsRead(): void
    {
        if (!$this->is_read) {
            $this->is_read = true;
            $this->read_at = now();
            $this->save();
        }
    }

    /**
     * Check if message is an offer.
     */
    public function isOffer(): bool
    {
        return $this->type === MessageType::OFFER;
    }

    /**
     * Accept offer.
     */
    public function acceptOffer(): void
    {
        if ($this->isOffer()) {
            $this->offer_status = OfferStatus::ACCEPTED;
            $this->save();
        }
    }

    /**
     * Reject offer.
     */
    public function rejectOffer(): void
    {
        if ($this->isOffer()) {
            $this->offer_status = OfferStatus::REJECTED;
            $this->save();
        }
    }

    /**
     * Get offer price in Rupiah.
     */
    public function getOfferPriceInRupiah(): ?float
    {
        return $this->offer_price ? $this->offer_price / 100 : null;
    }
}
