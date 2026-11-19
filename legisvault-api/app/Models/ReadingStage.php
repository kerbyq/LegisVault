<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Class ReadingStage
 *
 * @package App\Models
 * @property int $id
 * @property int $document_id
 * @property string $stage
 * @property int $transitioned_by
 * @property string|null $notes
 * @property \Illuminate\Support\Carbon $transitioned_at
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 */
class ReadingStage extends Model
{
    use HasFactory;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'reading_stages';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'document_id',
        'stage',
        'transitioned_by',
        'notes',
        'transitioned_at',
    ];

    /**
     * The attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'transitioned_at' => 'datetime',
        ];
    }

    /*
    |--------------------------------------------------------------------------
    | Relationships
    |--------------------------------------------------------------------------
    */

    /**
     * Document associated with this stage transition.
     */
    public function document(): BelongsTo
    {
        return $this->belongsTo(Document::class, 'document_id');
    }

    /**
     * User who authorized and transitioned this reading stage.
     */
    public function transitioner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'transitioned_by');
    }
}
