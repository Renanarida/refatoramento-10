<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('reunioes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')               // dono/criador
                  ->constrained('users')
                  ->cascadeOnDelete();
            $table->string('titulo');
            $table->text('descricao')->nullable();
            $table->dateTime('inicio');                // data/hora da reunião
            $table->dateTime('fim')->nullable();       // opcional
            $table->string('local')->nullable();       // link/ sala
            $table->timestamps();

            $table->index(['user_id','inicio']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('reunioes');
    }
};
