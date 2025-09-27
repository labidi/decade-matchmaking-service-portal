<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Queue processing schedule
Schedule::command('queue:work database --stop-when-empty --max-jobs=100 --max-time=50')
    ->everyMinute()
    ->withoutOverlapping()
    ->runInBackground();

// Process high-priority mail queue
Schedule::command('queue:work database --queue=mail-priority --stop-when-empty --max-jobs=50 --max-time=50')
    ->everyMinute()
    ->withoutOverlapping()
    ->runInBackground();

// Restart queue workers daily to prevent memory leaks
Schedule::command('queue:restart')
    ->daily()
    ->at('03:00');

// Clean up old failed jobs (older than 7 days)
Schedule::command('queue:prune-failed --hours=168')
    ->daily()
    ->at('02:00');

// Queue health check every 5 minutes
Schedule::command('queue:health-check')
    ->everyFiveMinutes()
    ->runInBackground();

// Close expired opportunities daily at 2:00 AM
Schedule::command('opportunities:close-expired --force')
    ->daily()
    ->at('02:00')
    ->withoutOverlapping()
    ->runInBackground()
    ->appendOutputTo(storage_path('logs/opportunity-closure.log'));
