<?php

namespace App\Events;

use App\Models\CancelRequest;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class CancelRequestCreated
{
    use Dispatchable, SerializesModels;

    public function __construct(public CancelRequest $cancelRequest)
    {
    }
}
