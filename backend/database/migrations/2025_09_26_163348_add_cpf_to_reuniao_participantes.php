<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
  public function up(): void {
    Schema::table('reuniao_participantes', function (Blueprint $table) {
      $table->string('cpf', 14)->nullable()->index();
      $table->unique(['reuniao_id','cpf']);
    });
  }

  public function down(): void {
    Schema::table('reuniao_participantes', function (Blueprint $table) {
      $table->dropUnique(['reuniao_id','cpf']);
      $table->dropColumn('cpf');
    });
  }
};
