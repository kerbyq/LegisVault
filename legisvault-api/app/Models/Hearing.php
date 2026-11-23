<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class Hearing extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'hearing_code',
        'title',
        'type',
        'hearing_date',
        'start_time',
        'venue',
        'committee_id',
        'document_id',
        'presiding_officer',
        'status',
        'agenda_count',
        'notes',
        'created_by',
    ];

    protected $casts = [
        'hearing_date' => 'date:Y-m-d',
        'agenda_count' => 'integer',
    ];

    public function committee(): BelongsTo
    {
        return $this->belongsTo(Committee::class);
    }

    public function document(): BelongsTo
    {
        return $this->belongsTo(Document::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
