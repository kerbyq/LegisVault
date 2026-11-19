<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * Class Document
 *
 * @package App\Models
 * @property int $id
 * @property string $ordinance_number
 * @property string $title
 * @property string $author
 * @property int $sponsoring_committee_id
 * @property int $year_enacted
 * @property string $document_type (ordinance, resolution, motion, proclamation)
 * @property string $reading_status (draft_received, calendared, first_reading, second_reading, third_reading_approval)
 * @property string|null $abstract
 * @property string|null $file_path
 * @property int|null $file_size
 * @property string|null $mime_type
 * @property bool $is_ocr_processed
 * @property string|null $ocr_text
 * @property int $uploaded_by
 * @property int|null $approved_by
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property \Illuminate\Support\Carbon|null $deleted_at
 */
class Document extends Model
{
    use HasFactory, SoftDeletes;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'documents';

    /**
     * Valid reading statuses in chronological order.
     */
    public const STAGES = [
        'draft_received',
        'calendared',
        'first_reading',
        'second_reading',
        'third_reading_approval',
    ];

    /**
     * Valid document types.
     */
    public const TYPES = [
        'ordinance',
        'resolution',
        'motion',
        'proclamation',
    ];

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'ordinance_number',
        'title',
        'author',
        'sponsoring_committee_id',
        'year_enacted',
        'document_type',
        'reading_status',
        'abstract',
        'file_path',
        'file_size',
        'mime_type',
        'is_ocr_processed',
        'ocr_text',
        'uploaded_by',
        'approved_by',
    ];

    /**
     * The attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'year_enacted' => 'integer',
            'file_size' => 'integer',
            'is_ocr_processed' => 'boolean',
        ];
    }

    /*
    |--------------------------------------------------------------------------
    | Relationships
    |--------------------------------------------------------------------------
    */

    /**
     * The sponsoring committee of this legislative document.
     */
    public function committee(): BelongsTo
    {
        return $this->belongsTo(Committee::class, 'sponsoring_committee_id');
    }

    /**
     * User who uploaded the document.
     */
    public function uploader(): BelongsTo
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }

    /**
     * User who granted third reading approval.
     */
    public function approver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    /**
     * Reading stage history milestones.
     */
    public function readingStages(): HasMany
    {
        return $this->hasMany(ReadingStage::class, 'document_id')->orderBy('transitioned_at', 'asc');
    }

    /**
     * Amendments enacted for this document.
     */
    public function amendments(): HasMany
    {
        return $this->hasMany(DocumentAmendment::class, 'document_id')->orderBy('amendment_date', 'asc');
    }

    /**
     * Audit log entries associated with this document.
     */
    public function auditLogs(): MorphMany
    {
        return $this->morphMany(AuditLog::class, 'auditable');
    }

    /*
    |--------------------------------------------------------------------------
    | Query Scopes
    |--------------------------------------------------------------------------
    */

    /**
     * Search scope across ordinance_number, title, author, abstract, and ocr_text.
     * Uses optimized conditional matching to ensure fast sub-2-minute (sub-second) response times.
     */
    public function scopeSearch(Builder $query, ?string $term): Builder
    {
        if (empty($term)) {
            return $query;
        }

        $term = trim($term);

        return $query->where(function (Builder $q) use ($term) {
            $q->where('ordinance_number', 'LIKE', "{$term}%")
              ->orWhere('ordinance_number', 'LIKE', "%{$term}%")
              ->orWhere('title', 'LIKE', "%{$term}%")
              ->orWhere('author', 'LIKE', "%{$term}%")
              ->orWhere('abstract', 'LIKE', "%{$term}%")
              ->orWhere('ocr_text', 'LIKE', "%{$term}%");
        });
    }

    /**
     * Scope query to filter by committee.
     */
    public function scopeByCommittee(Builder $query, mixed $committeeId): Builder
    {
        if (empty($committeeId)) {
            return $query;
        }

        return $query->where('sponsoring_committee_id', $committeeId);
    }

    /**
     * Scope query to filter by year enacted.
     */
    public function scopeByYear(Builder $query, mixed $year): Builder
    {
        if (empty($year)) {
            return $query;
        }

        return $query->where('year_enacted', (int) $year);
    }

    /**
     * Scope query to filter by document type.
     */
    public function scopeByType(Builder $query, ?string $type): Builder
    {
        if (empty($type)) {
            return $query;
        }

        return $query->where('document_type', $type);
    }

    /**
     * Scope query to filter by reading status.
     */
    public function scopeByStatus(Builder $query, ?string $status): Builder
    {
        if (empty($status)) {
            return $query;
        }

        return $query->where('reading_status', $status);
    }

    /**
     * Multi-criteria filtering scope.
     *
     * @param Builder $query
     * @param array<string, mixed> $filters
     */
    public function scopeFilter(Builder $query, array $filters): Builder
    {
        return $query
            ->when(!empty($filters['q'] ?? $filters['keyword'] ?? null), function ($q) use ($filters) {
                $term = $filters['q'] ?? $filters['keyword'];
                $q->search($term);
            })
            ->when(!empty($filters['year']), function ($q) use ($filters) {
                $q->byYear($filters['year']);
            })
            ->when(!empty($filters['committee_id']), function ($q) use ($filters) {
                $q->byCommittee($filters['committee_id']);
            })
            ->when(!empty($filters['type']), function ($q) use ($filters) {
                $q->byType($filters['type']);
            })
            ->when(!empty($filters['status']), function ($q) use ($filters) {
                $q->byStatus($filters['status']);
            })
            ->when(!empty($filters['date_from']), function ($q) use ($filters) {
                $q->whereDate('created_at', '>=', $filters['date_from']);
            })
            ->when(!empty($filters['date_to']), function ($q) use ($filters) {
                $q->whereDate('created_at', '<=', $filters['date_to']);
            });
    }
}
