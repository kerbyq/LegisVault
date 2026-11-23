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
        Schema::create('hearings', function (Blueprint $table) {
            $table->id();
            $table->string('hearing_code')->unique();
            $table->string('title');
            $table->enum('type', ['regular_session', 'public_hearing', 'committee_hearing'])->default('committee_hearing');
            $table->date('hearing_date');
            $table->string('start_time', 20);
            $table->string('venue');
            $table->foreignId('committee_id')->nullable()->constrained('committees')->nullOnDelete();
            $table->foreignId('document_id')->nullable()->constrained('documents')->nullOnDelete();
            $table->string('presiding_officer')->nullable();
            $table->enum('status', ['scheduled', 'in_session', 'completed', 'deferred'])->default('scheduled');
            $table->unsignedSmallInteger('agenda_count')->default(1);
            $table->text('notes')->nullable();
            $table->foreignId('created_by')->constrained('users')->onDelete('cascade');
            $table->timestamps();
            $table->softDeletes();

            $table->index('hearing_date');
            $table->index('status');
            $table->index('type');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('hearings');
    }
};
