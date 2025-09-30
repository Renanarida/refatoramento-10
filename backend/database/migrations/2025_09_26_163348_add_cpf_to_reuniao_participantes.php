<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('reuniao_participantes', function (Blueprint $table) {
            if (!Schema::hasColumn('reuniao_participantes', 'cpf')) {
                // armazenar apenas dígitos (11)
                $table->char('cpf', 11)->nullable()->after('email');
                $table->index('cpf', 'rp_cpf_idx');
            }

            // impedir duplicidade do mesmo CPF na MESMA reunião (opcional)
            // ajuste o nome da coluna da FK se for diferente de 'reuniao_id'
            $hasUnique = false;
            try {
                // tentamos criar; se já existir, o DB vai avisar
                $table->unique(['reuniao_id', 'cpf'], 'rp_unique_reuniao_cpf');
            } catch (\Throwable $e) {
                $hasUnique = true;
            }
        });
    }

    public function down(): void
    {
        Schema::table('reuniao_participantes', function (Blueprint $table) {
            // remover unique/index se existirem
            try { $table->dropUnique('rp_unique_reuniao_cpf'); } catch (\Throwable $e) {}
            try { $table->dropIndex('rp_cpf_idx'); } catch (\Throwable $e) {}
            if (Schema::hasColumn('reuniao_participantes', 'cpf')) {
                $table->dropColumn('cpf');
            }
        });
    }
};
