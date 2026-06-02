<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote')->hourly();

// Auto-confirm orders 3 days after seller delivery (like Shopee/Tokopedia)
Schedule::command('orders:auto-confirm')->hourly();

// Auto-cancel unpaid/unconfirmed orders after 24 hours
Schedule::command('orders:auto-cancel')->hourly();
