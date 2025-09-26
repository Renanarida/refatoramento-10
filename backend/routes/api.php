<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Storage;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\UsuarioController;
use App\Http\Controllers\ReuniaoController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
| Prefix automático: /api
| Ex.: GET /api/reunioes, POST /api/login, etc.
*/

// ---------- AUTENTICAÇÃO & USUÁRIOS (públicas) ----------
Route::post('/usuarios', [UsuarioController::class, 'store'])->name('usuarios.store'); // cadastro
Route::post('/login', [AuthController::class, 'login']);                               // login

// ---------- ROTAS PROTEGIDAS (require auth:sanctum) ----------
Route::middleware('auth:sanctum')->group(function () {
    // sessão
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']); // usa o controller

    // perfil: upload de avatar
    Route::post('/me/avatar', function (Request $request) {
        $request->validate([
            'avatar' => ['required','image','mimes:png,jpg,jpeg,webp','max:2048'],
        ]);

        $user = $request->user();

        if ($user->avatar_path && Storage::disk('public')->exists($user->avatar_path)) {
            Storage::disk('public')->delete($user->avatar_path);
        }

        $path = $request->file('avatar')->store('avatars', 'public');

        $user->avatar_path = $path;
        $user->save();

        return response()->json([
            'message'   => 'Avatar atualizado com sucesso!',
            'avatar_url'=> asset('storage/'.$path),
        ]);
    });

    // ---------- REUNIÕES (agora privadas) ----------
    Route::prefix('reunioes')->group(function () {
        Route::get('/', [ReuniaoController::class, 'index']);        // /api/reunioes
        Route::get('/stats', [ReuniaoController::class, 'stats']);   // /api/reunioes/stats
        Route::get('/cards', [ReuniaoController::class, 'cards']);   // /api/reunioes/cards
        Route::post('/', [ReuniaoController::class, 'store']);       // /api/reunioes
        Route::get('/{reuniao}', [ReuniaoController::class, 'show']); 
        Route::put('/{reuniao}', [ReuniaoController::class, 'update']);
        Route::delete('/{reuniao}', [ReuniaoController::class, 'destroy']);
    });
});
