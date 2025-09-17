<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\UsuarioController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

// Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
//     return $request->user();
// });

// rota pública para cadastro
Route::post('/usuarios', [UsuarioController::class, 'store'])->name('usuarios.store');

// rotas protegidas (precisam de login)
Route::middleware('auth:sanctum')->group(function () {
    // Route::apiResource('Reuniao', ReuniaoController::class);
    // futuramente: rotas de listar usuários, etc.
});