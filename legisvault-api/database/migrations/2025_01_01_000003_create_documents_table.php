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
        Schema::create('documents', function (Blueprint $table) {
            $table->id();
            $table->string('ordinance_number')->unique();
            $table->string('title');
            $table->string('author');
            $table->foreignId('sponsoring_committee_id')->constrained('committees')->onDelete('cascade');
            $table->unsignedSmallInteger('year_enacted');
            $table->enum('document_type', ['ordinance', 'resolution', 'motion', 'proclamation']);
            $table->enum('reading_status', [
                'draft_received',
                'calendared',
                'first_reading',
                'second_reading',
                'third_reading_approval'
            ])->default('draft_received');
            $table->text('abstract')->nullable();
            $table->string('file_path')->nullable();
            $table->unsignedBigInteger('file_size')->nullable();
            $table->string('mime_type')->nullable();
            $table->boolean('is_ocr_processed')->default(false);
            $table->longText('ocr_text')->nullable();
            $table->foreignId('uploaded_by')->constrained('users')->onDelete('cascade');
            $table->foreignId('approved_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->softDeletes();

            // Indexes for fast searching and filtering
            $table->index('ordinance_number');
            $table->index('title');
            $table->index('year_enacted');
            $table->index('reading_status');
            $table->index('document_type');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('documents');
    }
};
