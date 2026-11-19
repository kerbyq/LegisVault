<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Class DocumentAmendment
 *
 * @package App\Models
 * @property int $id
 * @property int $document_id
 * @property string $amendment_number
 * @property string $description
 * @property int $amended_by
 * @property \Illuminate\Support\Carbon $amendment_date
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 */
class DocumentAmendment extends Model
{
    use HasFactory;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'document_amendments';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'document_id',
        'amendment_number',
        'description',
        'amended_by',
        'amendment_date',
    ];

    /**
     * The attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'amendment_date' => 'date',
        ];
    }

    /*
    |--------------------------------------------------------------------------
    | Relationships
    |--------------------------------------------------------------------------
    */

    /**
     * Document that this amendment modifies.
     */
    public function document(): BelongsTo
    {
        return $this->belongsTo(Document::class, 'document_id');
    }

    /**
     * User who authored or registered this amendment.
     */
    public function amender(): BelongsTo
    {
        return $this->belongsTo(User::class, 'amended_by');
    }
}
