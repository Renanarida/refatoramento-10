<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('reuniao_participantes', function (Blueprint $table) {
            if (!Schema::hasColumn('reuniao_participantes', 'telefone')) {
                $table->string('telefone', 11)->nullable()->after('cpf'); // 10-11 dígitos BR
            }
        });
    }

    public function down(): void
    {
        Schema::table('reuniao_participantes', function (Blueprint $table) {
            if (Schema::hasColumn('reuniao_participantes', 'telefone')) {
                $table->dropColumn('telefone');
            }
        });
    }
};