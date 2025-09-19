<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('reunioes', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->foreignId('user_id')->constrained('users'); // criador/dono
            $table->string('titulo');
            $table->text('descricao')->nullable();
            $table->date('data')->index();
            $table->time('hora')->index();
            $table->string('local')->nullable();
            $table->json('metadados')->nullable(); // ex: { "meet_url": "..." }
            $table->timestamps();
        });

        Schema::create('reuniao_participantes', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->foreignId('reuniao_id')->constrained('reunioes')->onDelete('cascade');
            $table->string('nome')->nullable();
            $table->string('email')->nullable()->index();
            $table->string('papel')->nullable(); // host, convidado, etc.
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('reuniao_participantes');
        Schema::dropIfExists('reunioes');
    }
};
