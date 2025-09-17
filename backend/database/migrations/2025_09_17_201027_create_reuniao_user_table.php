<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('reuniao_user', function (Blueprint $table) {
            $table->id();
            $table->foreignId('reuniao_id')->constrained('reunioes')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->timestamps();

            $table->unique(['reuniao_id','user_id']); // evita duplicado
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('reuniao_user');
    }
};
