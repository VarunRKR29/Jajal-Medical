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
        Schema::create('cases', function (Blueprint $table) {
            $table->id();
            $table->string('case_number', 50)->unique();
            $table->string('patient_reference', 50); // Dummy code e.g. PT-98214
            $table->string('surgeon_name');
            $table->string('implant_type');
            $table->enum('status', [
                'Draft',
                'Planning',
                'In Review',
                'Approved',
                'Completed',
                'Cancelled'
            ])->default('Draft')->index();
            $table->enum('priority', ['Low', 'Medium', 'High'])->default('Medium')->index();
            $table->date('surgery_date')->nullable();
            
            // Foreign key to users.id as specified in requirements
            $table->foreignId('created_by')
                  ->constrained('users')
                  ->onDelete('restrict');

            $table->text('notes')->nullable();
            $table->string('hospital_site')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('cases');
    }
};
