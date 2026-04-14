<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Enums\ReportStatus;
use App\Enums\ReportPriority;

class Report extends Model
{
    use HasFactory;

    protected $fillable = [
        'uuid',
        'report_number',
        'reporter_id',
        'reported_user_id',
        'product_id',
        'reason',
        'description',
        'status',
        'priority',
        'admin_notes',
        'resolution',
        'resolved_at',
    ];

    protected $casts = [
        'resolved_at' => 'datetime',
        'status' => ReportStatus::class,
        'priority' => ReportPriority::class,
    ];

    /**
     * Get the reporter (user who made the report).
     */
    public function reporter()
    {
        return $this->belongsTo(User::class, 'reporter_id');
    }

    /**
     * Get the reported user.
     */
    public function reportedUser()
    {
        return $this->belongsTo(User::class, 'reported_user_id');
    }

    /**
     * Get the product (if any).
     */
    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    /**
     * Get the evidences for the report.
     */
    // public function evidences()
    // {
    //     return $this->hasMany(ReportEvidence::class);
    // }

    /**
     * Get evidence URLs as array.
     */
    // public function getEvidenceUrls(): array
    // {
    //     return $this->evidences->pluck('url')->toArray();
    // }

    /**
     * Generate report number.
     */
    public static function generateReportNumber(): string
    {
        $date = now()->format('Ymd');
        $random = str_pad(random_int(0, 9999), 4, '0', STR_PAD_LEFT);
        return "RP-{$date}-{$random}";
    }

    /**
     * Mark as reviewed.
     */
    public function markAsReviewed(): void
    {
        $this->status = ReportStatus::REVIEWED;
        $this->save();
    }

    /**
     * Resolve the report.
     */
    public function resolve(string $resolution, ?string $adminNotes = null): void
    {
        $this->status = ReportStatus::RESOLVED;
        $this->resolution = $resolution;
        $this->admin_notes = $adminNotes;
        $this->resolved_at = now();
        $this->save();
    }

    /**
     * Dismiss the report.
     */
    public function dismiss(?string $adminNotes = null): void
    {
        $this->status = ReportStatus::DISMISSED;
        $this->admin_notes = $adminNotes;
        $this->resolved_at = now();
        $this->save();
    }

    /**
     * Set priority.
     */
    public function setPriority(ReportPriority $priority): void
    {
        $this->priority = $priority;
        $this->save();
    }
}
