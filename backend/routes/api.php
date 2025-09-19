<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\UsuarioController;
use App\Http\Controllers\ReuniaoController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Aqui você registra as rotas da sua API.
|
*/

// rota pública para cadastro de usuários
Route::post('/usuarios', [UsuarioController::class, 'store'])->name('usuarios.store');

// rotas de reuniões (públicas por enquanto, você pode mover para dentro de 'auth:sanctum' depois se quiser proteger)
Route::prefix('reunioes')->group(function () {
    Route::get('/', [ReuniaoController::class, 'index']);       // lista/paginação + filtros
    Route::get('/cards', [ReuniaoController::class, 'cards']);  // dados dos cards
    Route::post('/', [ReuniaoController::class, 'store']);      // criar reunião
    Route::get('/{reuniao}', [ReuniaoController::class, 'show']);   // detalhe de uma reunião
    Route::put('/{reuniao}', [ReuniaoController::class, 'update']); // atualizar reunião
    Route::delete('/{reuniao}', [ReuniaoController::class, 'destroy']); // excluir reunião
});

// rotas protegidas (precisam de login)
Route::middleware('auth:sanctum')->group(function () {
    // futuramente: rotas de listar usuários, etc.
});
