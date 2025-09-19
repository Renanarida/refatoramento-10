<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('reunioes', function (Blueprint $table) {
            // solta qualquer FK anterior (users/pessoas_dados) se existir
            try { $table->dropForeign(['user_id']); } catch (\Throwable $e) {}

            // deixa user_id opcional para destravar criação de reuniões
            $table->unsignedBigInteger('user_id')->nullable()->change();

            // ❌ sem foreign key por enquanto (vamos ligar quando a tabela alvo existir)
            // if (Schema::hasTable('pessoas_dados')) {
            //     $table->foreign('user_id')
            //           ->references('id')->on('pessoas_dados')
            //           ->nullOnDelete();
            // }
        });
    }

    public function down(): void
    {
        Schema::table('reunioes', function (Blueprint $table) {
            // volta a obrigatoriedade (se quiser) e pode recriar a FK depois
            // cuidado: só faça se tiver certeza que existem valores válidos
            $table->unsignedBigInteger('user_id')->nullable(false)->change();
        });
    }
};
