<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('reading_stages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('document_id')->constrained('documents')->onDelete('cascade');
            $table->enum('stage', [
                'draft_received',
                'calendared',
                'first_reading',
                'second_reading',
                'third_reading_approval'
            ]);
            $table->foreignId('transitioned_by')->constrained('users')->onDelete('cascade');
            $table->text('notes')->nullable();
            $table->timestamp('transitioned_at')->useCurrent();
            $table->timestamps();

            // Composite index on document_id + stage
            $table->index(['document_id', 'stage']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('reading_stages');
    }
};
